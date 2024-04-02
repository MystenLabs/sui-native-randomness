// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// Module: roll_dice
/// This module contains the implementation of a dice rolling game.
/// It includes functionality to roll a dice quietly and to roll a dice while emitting an event and minting an NFT.
module roll_dice::roll_dice {
    use sui::random::{Self, Random};
    use sui::event;

    /// Struct: Dice
    /// A struct that represents a dice with a unique identifier and a value.
    /// Attributes:
    /// - id: UID - A unique identifier for the dice.
    /// - value: u8 - The value of the dice roll, ranging from 1 to 6.
    public struct Dice has key, store {
        id: UID,
        value: u8,
    }

    /// Struct: DiceValue
    /// A struct to encapsulate the value of a dice roll for the event emmition.
    /// Attributes:
    /// - value: u8 - The value of the dice roll.
    public struct DiceValue has copy, drop {
        value: u8,
    }

    /// Function: roll_dice_quiet
    /// Rolls a dice without emitting any events.
    /// Parameters:
    /// - r: &Random - A reference to a Random object.
    /// - ctx: &mut TxContext - A mutable reference to the transaction context.
    /// Returns:
    /// - u8 - The result of the dice roll
    entry fun roll_dice_quiet(
        r: &Random, 
        ctx: &mut TxContext
    ): u8 {
        let mut generator = random::new_generator(r, ctx); // generator is a PRG
        random::generate_u8_in_range(&mut generator, 1, 6)
    }

    /// Function: roll_dice_emit_event_mint_nft
    /// Rolls a dice, emits an event with the roll value, and mints a non-fungible token (NFT) representing the dice.
    /// Parameters:
    /// - r: &Random - A reference to a Random object.
    /// - ctx: &mut TxContext - A mutable reference to the transaction context.
    entry fun roll_dice_emit_event_mint_nft(
        r: &Random, 
        ctx: &mut TxContext
    ) {
        let value = roll_dice_quiet(r, ctx);
        event::emit(DiceValue { value });
        transfer::transfer(
            Dice { id: object::new(ctx), value }, 
            tx_context::sender(ctx)
        );
    }
}
