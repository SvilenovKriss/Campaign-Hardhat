import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Address } from "cluster";
import { Signer } from "ethers";
import { ethers } from "hardhat";


describe("Campaign", async function () {
  let campaignFactory: any;
  let campaigns: [Address];

  let accounts: Signer[];
  let owner: Signer;
  let vendor: Signer;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    vendor = accounts[2];
    owner = accounts[0];

    const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
    campaignFactory = await CampaignFactory.deploy();

    await campaignFactory.deployed();

    const createCampaignTx = await campaignFactory.createCampaign(100);

    campaigns = (await campaignFactory.getCampaigns());

    await createCampaignTx.wait();
  });

  it("Should return campaignFactory list with legnth 1", async function () {
    expect((await campaignFactory.getCampaigns()).length).to.equal(1);
  });
  it('Snould return minimum contribution of campaign', async function () {
    const myContract = await ethers.getContractAt("Campaign", campaigns[0].toString());

    //Convert response to integer otherwise will be object.
    expect(+(await myContract.minimumContribution())).to.equal(100);
  });
  it('Should be able to contribute', async () => {
    const myContract = await ethers.getContractAt("Campaign", campaigns[0].toString());
  
    //To make a transaction with another sender we need to use 'connect' and pass signer, not address!
    //Also to pass value from the sender, we need to pass object in the function call.
    const contractTx =await myContract.connect(accounts[1]).contribute({ value: ethers.utils.parseEther("0.5") });

    //AFTER MAKING A TRANSACTION, WE NEED TO WAIT FOR IT AND THEN CONTINUE WITH THE TEST.
    await contractTx.wait();

    expect(await myContract.approvers(accounts[1].getAddress())).to.equal(true);
  });
  it('Should be able to make a request', async () => {
    const myContract = await ethers.getContractAt("Campaign", campaigns[0].toString());
    
    const createRequestTx = await myContract.connect(owner).createRequest(await vendor.getAddress(), 500, 'Buying new LED TV 50 inches.');
    await createRequestTx.wait();
    
    //WE CAN'T GET ARRAY ELEMENTS SO WE NEED TO PASS INDEX.
    expect((await myContract.requests(0)).description).to.equal('Buying new LED TV 50 inches.');
  });
  it("ApproveRequest function should throw error: 'You need to be contributor to be able to approve!'", async () => {
    const myContract = await ethers.getContractAt("Campaign", campaigns[0].toString());
    
    const createRequestTx = await myContract.connect(owner).createRequest(await vendor.getAddress(), 500, 'Buying new LED TV 50 inches.');
    await createRequestTx.wait();

    expect(myContract.connect(accounts[3]).approveRequest(0, true)).to.be.revertedWith('You need to be contributor to be able to approve!');
  });
  it('Should call approveRequest and increase approvalCount to 1', async () => {
    const myContract = await ethers.getContractAt('Campaign', campaigns[0].toString());

    const createRequestTx = await myContract.connect(owner).createRequest(await vendor.getAddress(), 500, 'Buying new LED TV 50 inches.');
    await createRequestTx.wait();

    const contributeTx =await myContract.connect(accounts[1]).contribute({ value: ethers.utils.parseEther("0.5") });
    await contributeTx.wait();

    const approveRequestTx = await myContract.connect(accounts[1]).approveRequest(0, true);
    await approveRequestTx.wait();
    
    expect(+(await myContract.requests(0)).approvalCount).to.equal(1);
  });
  it("Should call approveRequest and throw error: 'You cannot vote more than once per request!'", async () => {
    const myContract = await ethers.getContractAt('Campaign', campaigns[0].toString());

    const createRequestTx = await myContract.connect(owner).createRequest(await vendor.getAddress(), 500, 'Buying new LED TV 50 inches.');
    await createRequestTx.wait();

    const contributeTx =await myContract.connect(accounts[1]).contribute({ value: ethers.utils.parseEther("0.5") });
    await contributeTx.wait();

    const approveRequestTx = await myContract.connect(accounts[1]).approveRequest(0, true);
    await approveRequestTx.wait();
    
    expect(myContract.connect(accounts[1]).approveRequest(0, true)).to.be.revertedWith('You cannot vote more than once per request!');
  });
  it('Should be able to finalizeRequest' ,async () => {
    const myContract = await ethers.getContractAt('Campaign', campaigns[0].toString());

    const createRequestTx = await myContract.connect(owner).createRequest(await vendor.getAddress(), 500, 'Buying new LED TV 50 inches.');
    await createRequestTx.wait();
    
    (await myContract.connect(accounts[1]).contribute({ value: ethers.utils.parseEther("0.5") })).wait();
    (await myContract.connect(accounts[2]).contribute({ value: ethers.utils.parseEther("0.5") })).wait();
    (await myContract.connect(accounts[3]).contribute({ value: ethers.utils.parseEther("0.5") })).wait();
    (await myContract.connect(accounts[4]).contribute({ value: ethers.utils.parseEther("0.5") })).wait();

    (await myContract.connect(accounts[1]).approveRequest(0, true)).wait();
    (await myContract.connect(accounts[2]).approveRequest(0, true)).wait();
    (await myContract.connect(accounts[3]).approveRequest(0, true)).wait();
    (await myContract.connect(accounts[4]).approveRequest(0, false)).wait();
    
    (await myContract.connect(owner).finalizeRequest(0)).wait();

    const request = (await myContract.requests(0));

    console.log('REQUEST: ', request);
    
    expect(request.status).to.equal(true);
  });
  //TODO TEST CONDITIONS IN CONTRIBUTE AND FINALIZE_REQUEST.
});
