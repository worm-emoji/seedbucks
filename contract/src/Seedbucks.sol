// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "solady/tokens/ERC20.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

contract Seedbucks is ERC20, Ownable {
    error AlreadyMinted();
    error InvalidSignature();

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event SeedbucksClaimed(uint256 indexed fid, uint256 indexed ethBalance);

    mapping(address => bool) public mintAddresses;
    mapping(uint256 => bool) public mintFids;
    address public signer;

    constructor() {
        _initializeOwner(msg.sender);
    }

    function name() public pure override returns (string memory) {
        return "Seedbucks";
    }

    function symbol() public pure override returns (string memory) {
        return "SBUX";
    }

    function mint(uint256 fid, bytes calldata signature) public {
        if (mintAddresses[msg.sender] || mintFids[fid]) {
            revert AlreadyMinted();
        }

        address recovered = ECDSA.recoverCalldata(keccak256(abi.encodePacked(fid, msg.sender)), signature);
        if (recovered != signer) {
            revert InvalidSignature();
        }

        mintAddresses[msg.sender] = true;
        mintFids[fid] = true;
        emit SeedbucksClaimed(fid, msg.sender.balance);

        _mint(msg.sender, 1e50 * msg.sender.balance);
    }

    function updateSigner(address _signer) public onlyOwner {
        emit SignerUpdated(signer, _signer);
        signer = _signer;
    }
}
