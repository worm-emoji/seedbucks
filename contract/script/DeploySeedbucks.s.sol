// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Seedbucks} from "../src/Seedbucks.sol";

contract DeploySeedbucks is Script {
    function run() public {
        vm.startBroadcast();
        Seedbucks sb = new Seedbucks();
        sb.updateSigner(0x41a4a9E5dA2Bb0E85dad5244DEacd1b70DA61187);
    }
}
