//SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

contract LotteryContract{
    address public manager;
    address public winner;
    uint minPlayers = 3;
    uint public playersCount;
    struct Lottery{
        uint amount;
        uint transactionCount;
    }
    mapping(address => Lottery) private lotteryBalances;
    address[] players;

    constructor(){
        manager = msg.sender;
    }

    receive() payable external WinnerNotSet{
        require(msg.value == 0.1 ether, "must send 0.1 ether!");
        address player = msg.sender;
        Lottery storage lottery = lotteryBalances[player];
        if(lottery.transactionCount == 0){
            players.push(player);
            playersCount++;
        }
        lotteryBalances[player].amount += msg.value;
        lotteryBalances[player].transactionCount += 1;
    }

    function getBalance() public view onlyManager returns(uint){
        return address(this).balance;
    }

    // helper function that returns a big random integer
    function random() internal view returns(uint){
       return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players.length)));
    }

    function pickWinner() public onlyManager WinnerNotSet returns(address){
        require(playersCount >= minPlayers, "require min 3 players!");
        address[] memory _players = players;
        uint winnerIndex = random() % playersCount;
        winner = _players[winnerIndex];
        return winner;
    }

    function getWinner() public view WinnerIsSet returns(address){
        return winner;
    }

    function withdraw() public WinnerIsSet{
        require(address(this).balance > 0, "insufficient balance");
        payable(winner).transfer(address(this).balance);
    }

    function resetGame() public onlyManager WinnerIsSet{
        require(address(this).balance == 0, "should withdraw first!");
        winner = address(0);
        players = new address[](0);
        playersCount = 0;
    }

    modifier onlyManager{
        require(msg.sender == manager, "only for the manager!");
        _;
    }

    modifier WinnerNotSet{
        require(winner == address(0), "winner is already set!");
        _;
    }

    modifier WinnerIsSet{
        require(winner != address(0), "the game is not over!");
        _;
    }


}