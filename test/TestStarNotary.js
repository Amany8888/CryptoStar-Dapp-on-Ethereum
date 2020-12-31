const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let starOwner = accounts[1];
    let starName = "AmanyStar";
    let starId = 6;
    await instance.createStar(starName,starId,{from: starOwner});
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let tokenName = await instance.myTokenName.call();
    let tokenSymbol = await instance.sympol.call();
    assert.equal(tokenName,"Amany Token");
    assert.equal(tokenSymbol,"SRT");
    assert.equal(await instance.lookUptokenIdToStarInfo(starId),starName);
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();
    let star1Owner= accounts[1];
    let star1Name = "AmanyStar7";
    let star1Id = 7;
    await instance.createStar(star1Name,star1Id,{from:star1Owner});
    let star2Owner = accounts[2];
    let star2Name = "AmanyStar8";
    let star2Id = 8;
    await instance.createStar(star2Name,star2Id,{from:star2Owner});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(star1Id,star2Id,{from:star1Owner})
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(star1Id), star2Owner);
    assert.equal(await instance.ownerOf(star2Id), star1Owner);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let strOwner= accounts[1];
    let starName = "AmanyStar9";
    let star9Id = 9;
    await instance.createStar(starName,star9Id,{from:strOwner});
    // 2. use the transferStar function implemented in the Smart Contract
    let newOwner = accounts[2];
    await instance.transferStar(newOwner,star9Id,{from:strOwner});
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf(star9Id),newOwner);
});
it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let strOwner= accounts[2];
    let starName = "AmanyStar10";
    let star9Id = 10;
    await instance.createStar(starName,star9Id,{from:strOwner});
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookUptokenIdToStarInfo(star9Id),starName);
});