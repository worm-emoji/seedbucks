// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {Seedbucks} from "../src/Seedbucks.sol";

contract CloseMint is Script {
    Seedbucks sb = Seedbucks(0x5b686cef77A9B5d48fFeF0632268423EC3211206);

    function run() public {
        vm.startBroadcast();
        sb.updateSigner(address(0));
        sb.renounceOwnership();
    }
}
