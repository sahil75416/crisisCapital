(
echo const { expect } = require("chai");
echo const { ethers } = require("hardhat");
echo.
echo describe("CrisisDEX", function () {
echo   let CrisisDEX, dex, owner, alice;
echo.
echo   beforeEach(async function () {
echo     [owner, alice] = await ethers.getSigners();
echo     CrisisDEX = await ethers.getContractFactory("CrisisDEX");
echo     dex = await CrisisDEX.deploy();
echo     await dex.deployed();
echo   });
echo.
echo   it("mints 1M CRISYS to owner", async function () {
echo     const bal = await dex.balanceOf(owner.address);
echo     expect(bal).to.equal(ethers.utils.parseEther("1000000"));
echo   });
echo.
echo   it("creates a market", async function () {
echo     const future = Math.floor(Date.now() / 1000) + 3600;
echo     await dex.createMarket("Amazon delay >30 min", future);
echo     const m = await dex.markets(1);
echo     expect(m.description).to.equal("Amazon delay >30 min");
echo   });
echo });
) > test\CrisisDEX.test.js