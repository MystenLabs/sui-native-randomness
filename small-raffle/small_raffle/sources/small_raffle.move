
/// Module: small_raffle
/// This module implements a simple raffle game where participants can join by paying an entry fee in SUI.
/// At the end of the game, a winner is randomly selected among the participants, and the balance is transferred to the winner.
module small_raffle::small_raffle {
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::random::{Self, Random, new_generator};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::tx_context::{sender};

    /// Error codes
    const EGameInProgress: u64 = 0;
    const EGameAlreadyCompleted: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const EReachedMaxParticipants: u64 = 3;

    const MaxParticipants: u32 = 500;

    /// Game represents a set of parameters of a single game.
    public struct Game has key {
        id: UID,
        cost_in_sui: u64,
        participants: u32,
        end_time: u64,
        balance: Balance<SUI>,
        participants_table: Table<u32, address>,
    }

    /// Create a shared-object Game.
    ///
    /// Parameters:
    /// - end_time: Timestamp when the game ends.
    /// - cost_in_sui: Cost in SUI to participate in the raffle.
    /// - ctx: Transaction context.
    public fun create(
        end_time: u64,
        cost_in_sui: u64,
        ctx: &mut TxContext
    ) {
        let game = Game {
            id: object::new(ctx),
            cost_in_sui,
            participants: 0,
            end_time,
            balance: balance::zero(),
            participants_table: table::new(ctx),
        };
        transfer::share_object(game);
    }

    /// Anyone can play.
    ///
    /// Parameters:
    /// - game: Reference to the game being played.
    /// - coin: Coin used to participate in the game.
    /// - clock: Current timestamp.
    /// - ctx: Transaction context.
    public fun play(
        game: &mut Game, 
        coin: Coin<SUI>, 
        clock: &Clock, 
        ctx: &mut TxContext
    ) {
        assert!(game.end_time > clock::timestamp_ms(clock), EGameAlreadyCompleted);
        assert!(coin::value(&coin) == game.cost_in_sui, EInvalidAmount);
        assert!(game.participants < MaxParticipants, EReachedMaxParticipants);

        game.participants = game.participants + 1;
        coin::put(&mut game.balance, coin);
        table::add(&mut game.participants_table, game.participants, sender(ctx));
    }
    
    /// Anyone can close the game and send the balance to the winner.
    ///
    /// The function is defined as private entry to prevent calls from other Move functions. (If calls from other
    /// functions are allowed, the calling function might abort the transaction depending on the winner.)
    /// Gas based attacks are not possible since the gas cost of this function is independent of the winner.
    ///
    /// Parameters:
    /// - game: Game object to be closed.
    /// - r: Random number generator.
    /// - clock: Current block timestamp.
    /// - ctx: Transaction context.
    entry fun close(
        game: Game,
        r: &Random,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(game.end_time <= clock::timestamp_ms(clock), EGameInProgress);
        let Game { id, cost_in_sui: _, participants, end_time: _, balance, mut participants_table } = game;
        
        if (participants == 1) {
            let winner = 1;
            let winner_address = *table::borrow(&participants_table, winner);
            let reward = coin::from_balance(balance, ctx);
            transfer::public_transfer(reward, winner_address);
            table::remove(&mut participants_table, 1);
        } else if (participants > 1) {
            let mut generator = new_generator(r, ctx);
            let winner = random::generate_u32_in_range(&mut generator, 1, participants);
            let winner_address = *table::borrow(&participants_table, winner);
            let reward = coin::from_balance(balance, ctx);
            transfer::public_transfer(reward, winner_address);

            let mut i = 1;
            while (i <= participants) {
                table::remove(&mut participants_table, i);
                i = i + 1;
            };
        } else {
            balance::destroy_zero(balance);
        };

        table::destroy_empty(participants_table);
        object::delete(id);
    }

}