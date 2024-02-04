// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {Test, console2} from "forge-std/Test.sol";
import {Seedbucks} from "../src/Seedbucks.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

contract SeedbucksTest is Test {
    Seedbucks seedbucks;

    function setUp() public {
        seedbucks = new Seedbucks();
        seedbucks.updateSigner(0x08e7e7a9BEe96A46085B772d676e9C255e09605b);
    }

    function testMint() public {
        vm.deal(0xa10FAb83fcd33aAE360ebAc10EcCfEea67eFB7BD, 1 ether);
        assertEq(seedbucks.signer(), 0x08e7e7a9BEe96A46085B772d676e9C255e09605b);
        vm.prank(0xa10FAb83fcd33aAE360ebAc10EcCfEea67eFB7BD);
        seedbucks.mint(
            1,
            address(0),
            hex"450d2d5a5b088a1caa73fc5fba399b1f18c473e1d86cc064961f6ed60a2a35d12e69f5948db7d6216e404f585e28a030809651607e00fb634eb7cca3ab31450c1b"
        );
    }
}
