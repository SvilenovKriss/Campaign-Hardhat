import { task, types } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-web3";

task("accounts", "Prints the list of accounts", async (taskArgs, hre,) => {
    const accounts = await hre.ethers.getSigners();


    for (const account of accounts) {
        console.log(account.address);
    }
});

task("balance", "Get balance of main account").addParam("account", "The account's address")
    .setAction(async (taskArgs, { web3 }) => {
        const account = web3.utils.toChecksumAddress(taskArgs.account);
        const balance = await web3.eth.getBalance(account);

        console.log(web3.utils.fromWei(balance, "ether"), "ETH");
    });


task("hello", "Prints 'Hello' multiple times")
    .addOptionalParam(
        "times",
        "The number of times to print 'Hello'",
        1,
        types.int
    )
    .setAction(async ({ times }) => {
        for (let i = 0; i < times; i++) {
            console.log("Hello");
        }
    });

task("minimum-contribution", "Get minimumCotribution of Campaign contract", async (taskArgs, hre,) => {
    const accounts = await hre.ethers.getSigners()
    const Campaign = await hre.ethers.getContractFactory("Campaign");
    const contract = await Campaign.attach(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    );

    console.log(await contract.functions.minimumCotribution);
});