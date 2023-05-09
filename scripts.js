document.getElementById("settingsForm")
    .addEventListener("submit", function (event) {
        event.preventDefault();

        const decks = parseInt(document.getElementById("decks").value);
        const h17 = document
            .getElementById("h17")
            .checked;
        const s17 = document
            .getElementById("s17")
            .checked;
        const das = document
            .getElementById("das")
            .checked;
        const restrictedDoubling = document
            .getElementById("restrictedDoubling")
            .checked;
        const lateSurrender = document
            .getElementById("lateSurrender")
            .checked;
        const es10 = document
            .getElementById("es10")
            .checked;
        let deck;
        const dataContainer = document.getElementById('data-container');

       
        // Store settings in an object
        const settings = {
            decks: decks,
            rule: h17
                ? "h17"
                : "s17",
            das: das,
            restrictedDoubling: restrictedDoubling,
            lateSurrender: lateSurrender,
            es10: es10

        };

        startGame(settings);
    });

let deck;
let deckIndex;

function startGame(settings) {
    // Hide settings form

    // Show game area
 //   const gameArea = document.getElementById("data-container");
  //  gameArea.style.display = "block";

    // Initialize game with selected settings
    console.log("Game settings:", settings);
    // ...

    deck = createDeck(settings.decks);
    deckIndex = 0;
    playGame();

}
function playGame() {
    const cutOff = Math.floor(deck.length * 0.8);
    const totalHands = 10;
    let handsPlayed = 0;
    let playerBalance = 0;
    let wins = 0;
    let losses = 0;
    let pushes = 0;
    let bet = 1;
    shuffleDeck(deck);

    const resultsContainer = document.getElementById('resultsContainer');


    while (handsPlayed < totalHands) {
        if (deck.length < cutOff) {
            shuffleDeck(deck);
        }

        const playerHand = [dealCard(), dealCard()];
        const dealerHand = [dealCard(), dealCard()];

        console.log("Player's hand:", playerHand.map(card => card.rank).join(", "));
        console.log("Dealer's hand:", dealerHand.map(card => card.rank).join(", "));

        if (isBlackjack(playerHand) && !canDealerHaveBlackjack(dealerHand)) {
            console.log("Player wins with blackjack!");
            playerBalance += bet * 1.5;
        } else {
            let handFinished = false;

            while (!handFinished) {
                const action = basicStrategy(playerHand, dealerHand[0], true, true, true);
                if (action === "hit") {
                    playerHand.push(dealCard());
                    console.log("Action:", action);
                    console.log("Player's hand:", playerHand.map(card => card.rank).join(", "));
                    if (isBusted(playerHand)) {
                        handFinished = true;
                    }
                } else if (action === "stand") {
                    console.log("Action:", action);
                    handFinished = true;
                } else if (action === "double") {
                    bet *= 2;
                    let newCard = dealCard(deck);
                    playerHand.push(newCard);
                    console.log(`Player doubles down and receives: ${newCard.rank}${newCard.suit}`);
                    handFinished = true;
                }  else if (action === "surrender") {
                    console.log("Action:", action);
                    playerBalance -= bet / 2; // Lose half of the bet
                    handFinished = true;
                    
                } else if (action === "split") {
                    
                    console.log("Player's hand:", playerHand.map(card => card.rank).join(", "));
                    console.log("Action:", action);
                    // Handle the split action here (e.g., create two new hands and update player balance)
                    const hand1 = [playerHand[0], dealCard()];
                    const hand2 = [playerHand[1], dealCard()];
                    const hands = [hand1, hand2];

                    const maxSplits = 3; // You can change this value to limit the number of allowed splits
                    const splits = [0, 0]; // Track the number of splits per hand
                
                     for (let i = 0; i < hands.length; i++) {
                         let splitHandFinished = false;
                         while (!splitHandFinished) {
                            const splitAction = basicStrategy(hands[i], dealerHand[0], true, true, true);
                            if (splitAction === "hit") {
                              hands[i].push(dealCard());
                                console.log("Split action:", splitAction);
                                console.log(`Player's hand ${i + 1}:`, hands[i].map(card => card.rank).join(", "));
                    if (isBusted(hands[i])) {
                        splitHandFinished = true;
                    }
                } else if (splitAction === "stand") {
                    console.log("Split action:", splitAction);
                    splitHandFinished = true;
                } else if (splitAction === "double") {
                    bet *= 2;
                    let newCard = dealCard(deck);
                    hands[i].push(newCard);
                    console.log(`Player doubles down on hand ${i + 1} and receives: ${newCard.rank}${newCard.suit}`);
                    splitHandFinished = true;
                }
                else if (splitAction === "split" && splits[i] < maxSplits && hands[i][0].rank === hands[i][1].rank) {
                    // Handle re-splitting
                    console.log("Re-splitting hand:", i + 1);
                    splits[i]++;
                    const newHand = [hands[i][1], dealCard()];
                    hands[i][1] = dealCard();
                    hands.push(newHand);
                    splits.push(splits[i]); // Copy the current number of splits to the new hand
                }
            }
        }
    }
        const dealerResult = resolveDealerHand(dealerHand);
        console.log("Dealer's hand:", dealerHand.map(card => card.rank).join(", "));

        const outcome = getHandOutcome(playerHand, dealerHand);
        if (outcome === "win") {
            playerBalance += bet;
            console.log(playerBalance);
        } else if (outcome === "lose") {
            playerBalance -= bet;
            console.log(playerBalance);
        }

        handsPlayed++;
    }

    console.log("Player balance after", totalHands, "hands:", playerBalance);
}   
    }
}
// Add basic strategy, isBusted, dealerShouldHit, and getHandOutcome functions
function basicStrategy(playerHand, dealerUpCard, canDouble, canSplit, canSurrender) {
    const playerTotal = handTotal(playerHand);
    const isSoft = hasAce(playerHand) && playerTotal <= 21;
    const dealerUpCardValue = dealerUpCard.value;

    if (playerHand.length === 2) {
        const card1 = playerHand[0];
        const card2 = playerHand[1];

        if (card1.rank === card2.rank) {
            if (canSplit) {
                if (["A", "8"].includes(card1.rank)) {
                    return "split";
                } else if (["2", "3", "7"].includes(card1.rank) && dealerUpCardValue >= 2 && dealerUpCardValue <= 7) {
                    return "split";
                } else if (["4"].includes(card1.rank) && (dealerUpCardValue === 5 || dealerUpCardValue === 6)) {
                    return "split";
                } else if (["6"].includes(card1.rank) && dealerUpCardValue >= 2 && dealerUpCardValue <= 6) {
                    return "split";
                } else if (["9"].includes(card1.rank) && dealerUpCardValue !== 7 && dealerUpCardValue !== 10 && dealerUpCardValue !== 1) {
                    return "split";
                }
            }
        }
        if (!isSoft && playerTotal < 9) {
            return "hit";
        }
        if (playerHand.length === 2) {
            if (!isSoft && playerTotal === 9) {
                if (dealerUpCardValue >= 3 && dealerUpCardValue <= 6) {
                    return "double";
                } else {
                    return "hit";
                }
            } else if (!isSoft && playerTotal === 10) {
                if (dealerUpCardValue >= 2 && dealerUpCardValue <= 9) {
                    return "double";
                } else {
                    return "hit";
                }
            } else if (!isSoft && playerTotal === 11) {
                if (dealerUpCardValue !== 1) {
                    return "double";
                } else {
                    return "hit";
                }
            }
        }
        if (isSoft) {
            if (playerTotal === 13 || playerTotal === 14) {
                return dealerUpCardValue >= 5 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 15 || playerTotal === 16) {
                return dealerUpCardValue >= 4 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 17) {
                return dealerUpCardValue >= 3 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 18) {
                return dealerUpCardValue >= 3 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "stand";
            } else if (playerTotal === 19) {
                return dealerUpCardValue === 6 && canDouble
                    ? "double"
                    : "stand";
            } else if (playerTotal === 20) {
                return dealerUpCardValue >= 2 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "stand";
            } else {
                return "stand";
            }
        }

        if (isSoft) {
            if (playerTotal === 13 || playerTotal === 14) {
                return dealerUpCardValue >= 5 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 15 || playerTotal === 16) {
                return dealerUpCardValue >= 4 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 17) {
                return dealerUpCardValue >= 3 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 18) {
                if (dealerUpCardValue >= 3 && dealerUpCardValue <= 6 && canDouble) {
                    return "double";
                } else if (dealerUpCardValue === 2 || dealerUpCardValue >= 7 && dealerUpCardValue <= 8) {
                    return "stand";
                } else {
                    return "hit";
                }
            } else {
                return "stand";
            }
        } else {
            if (playerTotal === 9) {
                return dealerUpCardValue >= 3 && dealerUpCardValue <= 6 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 10) {
                return dealerUpCardValue >= 2 && dealerUpCardValue <= 9 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal === 11) {
                return dealerUpCardValue !== 1 && canDouble
                    ? "double"
                    : "hit";
            } else if (playerTotal >= 12 && playerTotal <= 16) {
                if (dealerUpCardValue >= 2 && dealerUpCardValue <= 6) {
                    if (canSurrender && playerTotal === 16 && dealerUpCardValue >= 9) {
                        return "surrender";
                    } else {
                        return "stand";

                    }
                } else {
                    if (canSurrender && playerTotal === 15 && dealerUpCardValue === 10) {
                        return "surrender";
                    } else {
                        return "hit";
                    }
                }
            } else {
                return "stand";
            }
        }
    } else {
        if (isSoft) {
            if (playerTotal >= 19) {
                return "stand";
            } else if (playerTotal >= 17) {
                return dealerUpCard.value >= 3 && dealerUpCard.value <= 6
                    ? "stand"
                    : "hit";
            } else {
                return "hit";
            }
        } else {
            if (playerTotal >= 17) {
                return "stand";
            } else if (playerTotal >= 13) {
                return dealerUpCard.value >= 2 && dealerUpCard.value <= 6
                    ? "stand"
                    : "hit";
            } else {
                return "hit";
            }
        }
    }
}

function hasAce(hand) {
    return hand.some(card => card.rank === "A");
}

function isBusted(hand) {
    return handTotal(hand) > 21;
}

function dealerShouldHit(dealerHand) {
    return handTotal(dealerHand) < 17;
}

function getHandOutcome(playerHand, dealerHand) {
    const playerTotal = handTotal(playerHand);
    const dealerTotal = handTotal(dealerHand);

    if (isBusted(playerHand)) 
        return "lose";
    if (isBusted(dealerHand)) 
        return "win";
    if (playerTotal > dealerTotal) 
        return "win";
    if (playerTotal < dealerTotal) 
        return "lose";
    return "push";
}

function handTotal(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
        total += card.value;
        if (card.rank === "A") 
            aces++;
        }
    
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

function resolveDealerHand(dealerHand) {
    let dealerTotal = handTotal(dealerHand);

    while (dealerTotal <= 16) {
        let newCard = dealCard(deck);
        dealerHand.push(newCard);
        dealerTotal = handTotal(dealerHand);
    }

    return dealerHand;
}

function createDeck(numDecks) {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A"
    ];

    const deck = [];

    for (let d = 0; d < numDecks; d++) {
        for (let s = 0; s < suits.length; s++) {
            for (let r = 0; r < ranks.length; r++) {
                const card = {
                    rank: ranks[r],
                    suit: suits[s],
                    value: getCardValue(ranks[r])
                };
                deck.push(card);
            }
        }
    }

    return deck;
}

function getCardValue(rank) {
    switch (rank) {
        case "A":
            return 11;
        case "K":
        case "Q":
        case "J":
            return 10;
        default:
            return parseInt(rank);
    }
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCard() {
    const card = deck[deckIndex];
    deckIndex++;
    return card;
}

function isBlackjack(hand) {
    return hand.length === 2 && hand[0].value + hand[1].value === 21;
}

function canDealerHaveBlackjack(dealerHand) {
    const faceUpCard = dealerHand[0];
    const faceUpCardValue = faceUpCard.value;
    return [1, 10].includes(faceUpCardValue);
}
