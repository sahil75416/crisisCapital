// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title SnapStake - Micro-Risk Markets Platform
 * @dev Decentralized platform for trading micro-disruptions with AMM-based zero-counterparty insurance
 */
contract SnapStake is ERC20, Ownable, ReentrancyGuard {
    using Math for uint256;

    // Market types for different disruption categories
    enum DisruptionType { DELIVERY, TRANSIT, FLIGHT, SERVICE, WEATHER }
    
    // Market resolution states
    enum MarketState { ACTIVE, RESOLVED, CANCELLED, EXPIRED }

    struct MicroMarket {
        uint256 id;
        string description;
        DisruptionType disruptionType;
        uint256 creationTime;
        uint256 resolutionTime;
        uint256 actualResolutionTime;
        MarketState state;
        bool outcome; // true = disruption occurred, false = no disruption
        
        // AMM Pool Data
        uint256 yesTokens;
        uint256 noTokens;
        uint256 totalLiquidity;
        uint256 k; // Constant product (x * y = k)
        
        // Market metadata
        address creator;
        string dataSource;
        uint256 confidence;
        uint256 volume;
        uint256 participantCount;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
        uint256 liquidityShares;
        bool claimed;
        uint256 entryTime;
    }

    struct Oracle {
        address oracleAddress;
        string dataProvider;
        uint256 reliability;
        bool active;
    }

    // State variables
    mapping(uint256 => MicroMarket) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => uint256[]) public userMarkets;
    mapping(DisruptionType => Oracle[]) public oracles;
    mapping(address => bool) public authorizedOracles;
    
    uint256 public marketCount;
    uint256 public constant MARKET_DURATION = 30 minutes; // Max market duration
    uint256 public constant MIN_LIQUIDITY = 10 * 10**18; // 10 SNAP minimum
    uint256 public constant PLATFORM_FEE = 25; // 2.5% platform fee
    uint256 public constant ORACLE_REWARD = 5 * 10**18; // 5 SNAP for oracle resolution

    // Events
    event MarketCreated(
        uint256 indexed marketId,
        string description,
        DisruptionType disruptionType,
        uint256 resolutionTime,
        address creator
    );
    
    event TradeExecuted(
        uint256 indexed marketId,
        address indexed trader,
        bool prediction,
        uint256 amount,
        uint256 shares,
        uint256 price
    );
    
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        address resolver,
        uint256 resolutionTime
    );
    
    event LiquidityAdded(
        uint256 indexed marketId,
        address indexed provider,
        uint256 amount,
        uint256 shares
    );

    constructor() ERC20("SnapStake", "SNAP") {
        _mint(msg.sender, 10_000_000 * 10**18); // 10M SNAP initial supply
    }

    /**
     * @dev Create a new micro-risk market
     */
    function createMarket(
        string calldata _description,
        DisruptionType _disruptionType,
        string calldata _dataSource,
        uint256 _confidence
    ) external returns (uint256) {
        require(bytes(_description).length > 0, "Description required");
        require(_confidence >= 50 && _confidence <= 95, "Invalid confidence range");
        
        marketCount++;
        uint256 resolutionTime = block.timestamp + MARKET_DURATION;
        
        markets[marketCount] = MicroMarket({
            id: marketCount,
            description: _description,
            disruptionType: _disruptionType,
            creationTime: block.timestamp,
            resolutionTime: resolutionTime,
            actualResolutionTime: 0,
            state: MarketState.ACTIVE,
            outcome: false,
            yesTokens: MIN_LIQUIDITY / 2,
            noTokens: MIN_LIQUIDITY / 2,
            totalLiquidity: MIN_LIQUIDITY,
            k: (MIN_LIQUIDITY / 2) * (MIN_LIQUIDITY / 2),
            creator: msg.sender,
            dataSource: _dataSource,
            confidence: _confidence,
            volume: 0,
            participantCount: 0
        });

        // Transfer initial liquidity from creator
        _transfer(msg.sender, address(this), MIN_LIQUIDITY);
        
        userMarkets[msg.sender].push(marketCount);
        
        emit MarketCreated(marketCount, _description, _disruptionType, resolutionTime, msg.sender);
        return marketCount;
    }

    /**
     * @dev Buy prediction tokens using AMM pricing
     */
    function buyPrediction(
        uint256 _marketId,
        bool _prediction,
        uint256 _amount
    ) external nonReentrant returns (uint256 shares) {
        MicroMarket storage market = markets[_marketId];
        require(market.state == MarketState.ACTIVE, "Market not active");
        require(block.timestamp < market.resolutionTime, "Market expired");
        require(_amount > 0, "Amount must be positive");

        // Calculate shares using AMM formula
        shares = calculateShares(_marketId, _prediction, _amount);
        require(shares > 0, "Insufficient liquidity");

        // Update AMM pool
        if (_prediction) {
            market.yesTokens += _amount;
            market.noTokens = market.k / market.yesTokens;
        } else {
            market.noTokens += _amount;
            market.yesTokens = market.k / market.noTokens;
        }

        // Update user position
        Position storage position = positions[_marketId][msg.sender];
        if (position.entryTime == 0) {
            market.participantCount++;
            userMarkets[msg.sender].push(_marketId);
        }
        
        if (_prediction) {
            position.yesShares += shares;
        } else {
            position.noShares += shares;
        }
        position.entryTime = block.timestamp;

        // Update market stats
        market.volume += _amount;
        market.totalLiquidity += _amount;

        // Transfer tokens
        _transfer(msg.sender, address(this), _amount);

        emit TradeExecuted(_marketId, msg.sender, _prediction, _amount, shares, _amount * 10**18 / shares);
        return shares;
    }

    /**
     * @dev Calculate shares for AMM trade
     */
    function calculateShares(
        uint256 _marketId,
        bool _prediction,
        uint256 _amount
    ) public view returns (uint256) {
        MicroMarket memory market = markets[_marketId];
        
        if (_prediction) {
            // Buying YES tokens
            uint256 newYesTokens = market.yesTokens + _amount;
            uint256 newNoTokens = market.k / newYesTokens;
            return market.noTokens - newNoTokens;
        } else {
            // Buying NO tokens
            uint256 newNoTokens = market.noTokens + _amount;
            uint256 newYesTokens = market.k / newNoTokens;
            return market.yesTokens - newYesTokens;
        }
    }

    /**
     * @dev Get current market price for prediction
     */
    function getMarketPrice(uint256 _marketId, bool _prediction) external view returns (uint256) {
        MicroMarket memory market = markets[_marketId];
        
        if (_prediction) {
            return (market.noTokens * 10**18) / (market.yesTokens + market.noTokens);
        } else {
            return (market.yesTokens * 10**18) / (market.yesTokens + market.noTokens);
        }
    }

    /**
     * @dev Resolve market (oracle only)
     */
    function resolveMarket(
        uint256 _marketId,
        bool _outcome,
        string calldata _evidence
    ) external {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        
        MicroMarket storage market = markets[_marketId];
        require(market.state == MarketState.ACTIVE, "Market not active");
        require(block.timestamp >= market.resolutionTime, "Market not expired");

        market.state = MarketState.RESOLVED;
        market.outcome = _outcome;
        market.actualResolutionTime = block.timestamp;

        // Reward oracle
        _mint(msg.sender, ORACLE_REWARD);

        emit MarketResolved(_marketId, _outcome, msg.sender, block.timestamp);
    }

    /**
     * @dev Claim winnings from resolved market
     */
    function claimWinnings(uint256 _marketId) external nonReentrant returns (uint256 payout) {
        MicroMarket memory market = markets[_marketId];
        require(market.state == MarketState.RESOLVED, "Market not resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        require(position.yesShares > 0 || position.noShares > 0, "No position");

        // Calculate payout
        if (market.outcome && position.yesShares > 0) {
            // YES won
            payout = (position.yesShares * market.totalLiquidity) / market.yesTokens;
        } else if (!market.outcome && position.noShares > 0) {
            // NO won
            payout = (position.noShares * market.totalLiquidity) / market.noTokens;
        }

        if (payout > 0) {
            position.claimed = true;
            
            // Apply platform fee
            uint256 fee = (payout * PLATFORM_FEE) / 1000;
            payout -= fee;
            
            _transfer(address(this), msg.sender, payout);
            _transfer(address(this), owner(), fee);
        }

        return payout;
    }

    /**
     * @dev Add liquidity to market AMM pool
     */
    function addLiquidity(uint256 _marketId, uint256 _amount) external nonReentrant {
        MicroMarket storage market = markets[_marketId];
        require(market.state == MarketState.ACTIVE, "Market not active");
        require(_amount > 0, "Amount must be positive");

        // Calculate liquidity shares
        uint256 liquidityShares = (_amount * market.totalLiquidity) / (market.yesTokens + market.noTokens);
        
        // Update pool
        uint256 yesAdd = (_amount * market.yesTokens) / (market.yesTokens + market.noTokens);
        uint256 noAdd = _amount - yesAdd;
        
        market.yesTokens += yesAdd;
        market.noTokens += noAdd;
        market.totalLiquidity += _amount;
        market.k = market.yesTokens * market.noTokens;

        // Update user position
        positions[_marketId][msg.sender].liquidityShares += liquidityShares;

        _transfer(msg.sender, address(this), _amount);
        
        emit LiquidityAdded(_marketId, msg.sender, _amount, liquidityShares);
    }

    /**
     * @dev Get market information
     */
    function getMarketInfo(uint256 _marketId) external view returns (
        string memory description,
        DisruptionType disruptionType,
        uint256 creationTime,
        uint256 resolutionTime,
        MarketState state,
        bool outcome,
        uint256 yesPrice,
        uint256 noPrice,
        uint256 volume,
        uint256 participantCount
    ) {
        MicroMarket memory market = markets[_marketId];
        
        uint256 totalTokens = market.yesTokens + market.noTokens;
        yesPrice = totalTokens > 0 ? (market.noTokens * 10**18) / totalTokens : 5 * 10**17;
        noPrice = totalTokens > 0 ? (market.yesTokens * 10**18) / totalTokens : 5 * 10**17;
        
        return (
            market.description,
            market.disruptionType,
            market.creationTime,
            market.resolutionTime,
            market.state,
            market.outcome,
            yesPrice,
            noPrice,
            market.volume,
            market.participantCount
        );
    }

    /**
     * @dev Get user position in market
     */
    function getUserPosition(uint256 _marketId, address _user) external view returns (
        uint256 yesShares,
        uint256 noShares,
        uint256 liquidityShares,
        bool claimed,
        uint256 entryTime
    ) {
        Position memory position = positions[_marketId][_user];
        return (
            position.yesShares,
            position.noShares,
            position.liquidityShares,
            position.claimed,
            position.entryTime
        );
    }

    /**
     * @dev Authorize oracle for market resolution
     */
    function authorizeOracle(address _oracle, bool _authorized) external onlyOwner {
        authorizedOracles[_oracle] = _authorized;
    }

    /**
     * @dev Get user's active markets
     */
    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    /**
     * @dev Emergency market cancellation
     */
    function cancelMarket(uint256 _marketId) external onlyOwner {
        MicroMarket storage market = markets[_marketId];
        require(market.state == MarketState.ACTIVE, "Market not active");
        market.state = MarketState.CANCELLED;
    }
}
