const { expect } =  require("chai");
const { ethers } = require("hardhat");

describe("Lottery",  async() => {
    let lottery;
    let winner;

    before(async() =>{
        const Lottery = await ethers.getContractFactory("LotteryContract");
        lottery = await Lottery.deploy();
        console.log("lottery address: ", lottery.address);
    })

    it("contract balance should be zero", async() => {
        const balance = (await lottery.getBalance()).toString();
        console.log("balance: ", balance);
        expect(balance).to.equal('0');
    })

    it("should throw error get balance not manager", async() => {
        const [owner, otherAccount] = await ethers.getSigners();
        try{
            const balance = (await lottery.connect(otherAccount).getBalance()).toString();
            expect(balance).to.be.revertedWith("You can't withdraw yet");
        }catch(err){
           // console.log("err: ", err);
        }
    })

    it("should receive ether", async() => {
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();
        await otherAccount1.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther('0.1')
        });
        await otherAccount2.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther('0.1')
        });
        const balance = ethers.utils.formatEther((await lottery.getBalance()).toString());
        expect(balance).to.equal('0.2');
    })   

    it("receive should throw error", async() => {
        const [owner, otherAccount1, otherAccount2] = await ethers.getSigners();
        try{
            const receive = await otherAccount2.sendTransaction({
                to: lottery.address,
                value: ethers.utils.parseEther('0.2')
            });
            expect(receive).to.be.revertedWith("must send 0.1 ether!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("receive not pick winner, min players required", async() => {
        try{
            const winner = await lottery.pickWinner();
            expect(winner).to.be.revertedWith("require min 3 players!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("receive not pick winner not manager", async() => {
        const [owner, otherAccount1] = await ethers.getSigners();
        try{
            const winner = await lottery.connect(otherAccount1).pickWinner();
            expect(winner).to.be.revertedWith("only for the manager!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("receive pick winner", async() => {
        const [owner, otherAccount1, otherAccount2, otherAccount3] = await ethers.getSigners();
        try{
            await otherAccount3.sendTransaction({
                to: lottery.address,
                value: ethers.utils.parseEther('0.1')
            });
            const winner = await lottery.pickWinner();
            //console.log("winner: ", winner);
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("receive not pick winner, already set!", async() => {
        try{
            const winner = await lottery.pickWinner();
            expect(winner).to.be.revertedWith("winner is already set!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("should not reset game, should withdraw first", async() => {
        try{
            const winner = await lottery.resetGame();
            expect(winner).to.be.revertedWith("should withdraw first!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("should not reset game, only for the manager", async() => {
        const [owner, otherAccount1] = await ethers.getSigners();
        try{
            const winner = await lottery.connect(otherAccount1).resetGame();
            expect(winner).to.be.revertedWith("only for the manager!");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("should withdraw", async() => {
        const accounts = await ethers.getSigners();
        try{
            winner = await lottery.getWinner();
            const oldBalance = (await ethers.provider.getBalance(winner))
            //console.log("winner is: ", winner);
            //console.log("old balance is: ", oldBalance);
            await lottery.connect(accounts[5]).withdraw();
            const newBalance = (await ethers.provider.getBalance(winner));
            const difference = ethers.utils.formatEther(newBalance.sub(oldBalance));
            //console.log("old balance is: ", newBalance);
            //console.log("Difference: ", difference);
            expect(winner).to.equal("0.3");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("should not withdraw twice", async() => {
        const accounts = await ethers.getSigners();
        try{
            await lottery.connect(accounts[5]).withdraw();
            expect(winner).to.be.revertedWith("insufficient balance");
        }catch(err){
            //console.log("err: ", err);
        }
    })

    it("should reset game", async() => {
        try{
            await lottery.resetGame();
            const winner = await lottery.getWinner();
            const playersCount = (await lottery.playersCount()).toString();
            expect(winner).to.be.revertedWith("the game is not over!");
            expect(playersCount).to.equal(0);
        }catch(err){
            //console.log("err: ", err);
        }
    })


})