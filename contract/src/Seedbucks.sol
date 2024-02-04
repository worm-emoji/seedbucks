// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "solady/tokens/ERC20.sol";
import {Ownable} from "solady/auth/Ownable.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

contract Seedbucks is ERC20, Ownable {
    error AlreadyMinted();
    error InvalidSignature();

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event SeedbucksClaimed(uint256 indexed fid, address indexed minter, uint256 indexed ethBalance);
    event Referred(address indexed referrer, address indexed referred, uint256 indexed amount);

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

    function mint(uint256 fid, address referrer, bytes calldata signature) public {
        if (mintAddresses[msg.sender] || mintFids[fid]) {
            revert AlreadyMinted();
        }

        bytes32 hash = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(fid, msg.sender)));

        address recovered = ECDSA.tryRecover(hash, signature);
        if (recovered != signer) {
            revert InvalidSignature();
        }

        mintAddresses[msg.sender] = true;
        mintFids[fid] = true;

        emit SeedbucksClaimed(fid, msg.sender, msg.sender.balance);

        // mint 1 billion tokens per 1 ETH in the sender's balance
        uint256 amount = 1e9 * msg.sender.balance;

        // mint 10% of the tokens to the referrer
        if (referrer != address(0) && referrer != msg.sender) {
            uint256 referralShare = amount / 10;
            emit Referred(referrer, msg.sender, referralShare);
            _mint(referrer, referralShare);
        }

        _mint(msg.sender, amount);
    }

    function updateSigner(address _signer) public onlyOwner {
        emit SignerUpdated(signer, _signer);
        signer = _signer;
    }
}
