// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Seedbucks} from "../src/Seedbucks.sol";

contract DeploySeedbucks is Script {
    function run() public {
        vm.startBroadcast();
        Seedbucks sb = new Seedbucks();
        sb.updateSigner(0x08e7e7a9BEe96A46085B772d676e9C255e09605b);
    }
}
