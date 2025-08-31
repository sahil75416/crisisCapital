// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrisisDEX is ERC20, Ownable, ReentrancyGuard {
    struct CrisisMarket {
        uint256 id;
        string description;
        uint256 resolutionTime;
        uint256 totalStaked;
        uint256 yesShares;
        uint256 noShares;
        bool resolved;
        bool outcome;
        address creator;
        uint256 creationTime;
        uint256 totalVolume;
        uint256 liquidityPool;
    }

    struct Position {
        uint256 yesStake;
        uint256 noStake;
        bool claimed;
        uint256 lastStakeTime;
    }

    struct RiskToken {
        uint256 marketId;
        string symbol;
        uint256 totalSupply;
        uint256 price;
        bool active;
    }

    mapping(uint256 => CrisisMarket) public markets;
    mapping(uint256 => mapping(address => Position)) public positions;
    mapping(address => uint256[]) public userMarkets;
    mapping(uint256 => RiskToken) public riskTokens;
    mapping(address => uint256) public userTotalStaked;
    mapping(address => uint256) public userTotalWinnings;

    uint256 public marketCount;
    uint256 public constant CREATION_FEE = 100 * 10**18;
    uint256 public constant MIN_STAKE = 1 * 10**18;
    uint256 public constant LIQUIDITY_FEE = 25; // 2.5% of stakes
    uint256 public constant RESOLUTION_REWARD = 50 * 10**18; // 50 CRISYS for correct resolution

    event MarketCreated(uint256 indexed marketId, string description, address creator, uint256 resolutionTime);
    event Staked(uint256 indexed marketId, address indexed user, bool prediction, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome, uint256 totalPayout);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event RiskTokenCreated(uint256 indexed marketId, string symbol, uint256 initialPrice);
    event LiquidityAdded(uint256 indexed marketId, uint256 amount);

    constructor() ERC20("CrisisToken", "CRISYS") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }

    function createMarket(string calldata _description, uint256 _resolutionTime) external returns (uint256) {
        require(_resolutionTime > block.timestamp, "Invalid resolution time");
        require(balanceOf(msg.sender) >= CREATION_FEE, "Insufficient CRISYS");
        _transfer(msg.sender, address(this), CREATION_FEE);

        marketCount++;
        markets[marketCount] = CrisisMarket({
            id: marketCount,
            description: _description,
            resolutionTime: _resolutionTime,
            totalStaked: 0,
            yesShares: 0,
            noShares: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            creationTime: block.timestamp,
            totalVolume: 0,
            liquidityPool: 0
        });

        // Create risk token for this market
        string memory symbol = string(abi.encodePacked("CRISIS-", _uint2str(marketCount)));
        riskTokens[marketCount] = RiskToken({
            marketId: marketCount,
            symbol: symbol,
            totalSupply: 0,
            price: 1 * 10**18, // 1 CRISYS initial price
            active: true
        });

        userMarkets[msg.sender].push(marketCount);
        emit MarketCreated(marketCount, _description, msg.sender, _resolutionTime);
        emit RiskTokenCreated(marketCount, symbol, 1 * 10**18);
        
        return marketCount;
    }

    function stake(uint256 _marketId, bool _prediction, uint256 _amount) external nonReentrant {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        require(_amount >= MIN_STAKE, "Stake too small");
        require(!markets[_marketId].resolved, "Market already resolved");
        require(block.timestamp < markets[_marketId].resolutionTime, "Market expired");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");

        _transfer(msg.sender, address(this), _amount);
        
        // Calculate liquidity fee
        uint256 liquidityFee = (_amount * LIQUIDITY_FEE) / 1000;
        uint256 stakeAmount = _amount - liquidityFee;
        
        // Update market totals
        markets[_marketId].totalStaked += stakeAmount;
        markets[_marketId].totalVolume += _amount;
        markets[_marketId].liquidityPool += liquidityFee;
        
        // Update user position
        Position storage position = positions[_marketId][msg.sender];
        if (_prediction) {
            position.yesStake += stakeAmount;
            markets[_marketId].yesShares += stakeAmount;
        } else {
            position.noStake += stakeAmount;
            markets[_marketId].noShares += stakeAmount;
        }
        position.lastStakeTime = block.timestamp;
        
        // Update user totals
        userTotalStaked[msg.sender] += stakeAmount;
        
        emit Staked(_marketId, msg.sender, _prediction, stakeAmount);
    }

    function resolveMarket(uint256 _marketId, bool _outcome) external onlyOwner {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        require(!markets[_marketId].resolved, "Market already resolved");
        require(block.timestamp >= markets[_marketId].resolutionTime, "Market not yet expired");

        markets[_marketId].resolved = true;
        markets[_marketId].outcome = _outcome;
        
        // Reward market creator if they predicted correctly
        address creator = markets[_marketId].creator;
        if (positions[_marketId][creator].yesStake > 0 && _outcome) {
            _mint(creator, RESOLUTION_REWARD);
        } else if (positions[_marketId][creator].noStake > 0 && !_outcome) {
            _mint(creator, RESOLUTION_REWARD);
        }

        emit MarketResolved(_marketId, _outcome, markets[_marketId].totalStaked);
    }

    function claimWinnings(uint256 _marketId) external nonReentrant returns (uint256) {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        require(markets[_marketId].resolved, "Market not yet resolved");
        
        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        
        uint256 winnings = 0;
        if (markets[_marketId].outcome && position.yesStake > 0) {
            // Calculate winnings based on total pool and user's YES stake
            winnings = (markets[_marketId].totalStaked * position.yesStake) / markets[_marketId].yesShares;
        } else if (!markets[_marketId].outcome && position.noStake > 0) {
            // Calculate winnings based on total pool and user's NO stake
            winnings = (markets[_marketId].totalStaked * position.noStake) / markets[_marketId].noShares;
        }
        
        require(winnings > 0, "No winnings to claim");
        
        position.claimed = true;
        userTotalWinnings[msg.sender] += winnings;
        
        _transfer(address(this), msg.sender, winnings);
        
        emit WinningsClaimed(_marketId, msg.sender, winnings);
        return winnings;
    }

    function getMarketInfo(uint256 _marketId) external view returns (
        string memory description,
        uint256 resolutionTime,
        uint256 totalStaked,
        uint256 yesShares,
        uint256 noShares,
        bool resolved,
        bool outcome,
        address creator,
        uint256 creationTime,
        uint256 totalVolume,
        uint256 liquidityPool
    ) {
        CrisisMarket memory market = markets[_marketId];
        return (
            market.description,
            market.resolutionTime,
            market.totalStaked,
            market.yesShares,
            market.noShares,
            market.resolved,
            market.outcome,
            market.creator,
            market.creationTime,
            market.totalVolume,
            market.liquidityPool
        );
    }

    function getUserPosition(uint256 _marketId, address _user) external view returns (
        uint256 yesStake,
        uint256 noStake,
        bool claimed,
        uint256 lastStakeTime
    ) {
        Position memory position = positions[_marketId][_user];
        return (
            position.yesStake,
            position.noStake,
            position.claimed,
            position.lastStakeTime
        );
    }

    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    function getRiskToken(uint256 _marketId) external view returns (
        string memory symbol,
        uint256 totalSupply,
        uint256 price,
        bool active
    ) {
        RiskToken memory token = riskTokens[_marketId];
        return (
            token.symbol,
            token.totalSupply,
            token.price,
            token.active
        );
    }

    function addLiquidity(uint256 _marketId, uint256 _amount) external {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        require(_amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), _amount);
        markets[_marketId].liquidityPool += _amount;
        
        emit LiquidityAdded(_marketId, _amount);
    }

    function withdrawLiquidity(uint256 _marketId, uint256 _amount) external onlyOwner {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        require(_amount <= markets[_marketId].liquidityPool, "Insufficient liquidity");
        
        markets[_marketId].liquidityPool -= _amount;
        _transfer(address(this), owner(), _amount);
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), owner(), balance);
    }

    function pauseMarket(uint256 _marketId) external onlyOwner {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        riskTokens[_marketId].active = false;
    }

    function resumeMarket(uint256 _marketId) external onlyOwner {
        require(_marketId > 0 && _marketId <= marketCount, "Invalid market ID");
        riskTokens[_marketId].active = true;
    }
}