// import CardDeck from './carddeck';

console.log("---------- CardGame.js ------------");
console.log("Cookie:", document.cookie);

const mydeckid = document.cookie;

const btnNewGame = document.querySelector("#NewButton");
const btnDraw = document.querySelector("#DrawButton");
const btnStay = document.querySelector("#StayButton");

btnNewGame.addEventListener('click', () => { StartANewGame();})
btnDraw.addEventListener('click', () => { YouDrawACard(); })
btnStay.addEventListener('click', () => { YouStay();})

btnDraw.hidden = true;
btnStay.hidden = true;

function StartANewGame() {
	gameDeck.NewRound();
}

function YouDrawACard() {
	console.log("------ YOU DRAW ------");
	console.log(gameDeck);
	showSuccessMessage("");
	gameDeck.DrawCard();
}

function YouStay() {
	console.log("------ YOU STAY ------");
	showSuccessMessage("");
	gameDeck.DealerFinish();
}


function CreateCard(img) {
	console.log("---------- CREATE CARD ----------");
	console.log(img);
	let card = document.createElement('td');
	let imgtag = document.createElement('img');
	imgtag.src = img;
	imgtag.width = 80;
	imgtag.height = 120;
	card.appendChild(imgtag);
	console.log(card);
	return card;
}


/*

Req ANewDeck: http://deckofcardsapi.com/api/deck/new/
Response:
{
    "success": true,
    "deck_id": "3p40paa87x90",
    "shuffled": false,
    "remaining": 52
}

Req ANewDeck: http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1
Response:
{
    "success": true,
    "deck_id": "3p40paa87x90",
    "shuffled": true,
    "remaining": 52
}

Req DrawACard: http://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=2
Response:
{
    "success": true,
    "cards": [
        {
            "image": "http://deckofcardsapi.com/static/img/KH.png",
            "value": "KING",
            "suit": "HEARTS",
            "code": "KH"
        },
        {
            "image": "http://deckofcardsapi.com/static/img/8C.png",
            "value": "8",
            "suit": "CLUBS",
            "code": "8C"
        }
    ],
    "deck_id":"3p40paa87x90",
    "remaining": 50
}

Req ReShuffle: http://deckofcardsapi.com/api/deck/<<deck_id>>/shuffle/
Response:
{
    "success": true,
    "deck_id": "3p40paa87x90",
    "shuffled": true,
    "remaining": 52
}

 
 */


//reqNewDeck = "http://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
//reqDrawCards = "http://deckofcardsapi.com/api/deck/<<deck_id>>/draw/?count=2";
//reqShuffle = ""http://deckofcardsapi.com/api/deck/<<deck_id>>/shuffle/";

reqBaseUri = "http://deckofcardsapi.com/api/deck/";

// new Deck : reqBaseUri + reqNewDeck + 'deckCount'
// Shuffle  : reqBaseUri + 'deckid' + reqShuffe
// DrawCard : reqBaseUri + 'deckid' + reqDrawCards + 'NumberOfCards'


// request :
// 0 - shuffle
// 1 - draw cards
function CardAPI(request) {
	console.log("-----CardAPI-Request----");
	console.log("Request: ", request);

	// FORM REQUEST
	let req = null;
	switch (request) {
		case 0:	// shuffle
			showMessage("Shuffling...");
			console.log("Shuffle: ",gameDeck.game_deck.deck_id);
			if (gameDeck.game_deck.deck_id == null)
				req = reqBaseUri + "new/shuffle/?deck_count=" + gameDeck.game_deck.decks_count;
			else
				req = reqBaseUri + gameDeck.game_deck.deck_id + "/shuffle/";
			break;
		case 1: // draw cards
			showMessage("Wait...");
			if (gameDeck.game_player == 0) {
				if (gameDeck.dealer_cards.length == 0) gameDeck.game_draw = 2;	// first draw 2 cards
				else gameDeck.game_draw = 1;
			}
			else {
				if (gameDeck.you_cards.length == 0) gameDeck.game_draw = 2;	// first draw 2 cards
				else gameDeck.game_draw = 1;
			}
			req = reqBaseUri + gameDeck.game_deck.deck_id + "/draw/?count=" + gameDeck.game_draw;
			break;
		default:
			console.log("INVALID CardAPI REQUEST");
			return;
			break;
	}
	console.log(req, "Player", gameDeck.game_player);

	dealerCardStack = document.querySelector("#DealerCards");
	youCardStack = document.querySelector("#YourCards");


	// SEND REQUEST
	fetch(req, {
		method: 'GET',
		headers: {
			'Accept': 'application/json'
		}
	})
		.then(res => res.json())
		.then(data => {
			console.log("-----CardAPI-Data----");
			gameDeck.retry_count = 0;
			showSuccessMessage("");
			console.log(data);
			if (request == 0) {
				// Request Shuffle
				if (data.success) {
					if (mydeckid == null) { document.cookie = data.deck_id; }
					gameDeck.game_deck.deck_id = data.deck_id;
					gameDeck.game_deck.cards_remain = data.remaining;
					gameDeck.game_deck.cards_drawn = 0;
					showMessage(`DeckID: ${gameDeck.game_deck.deck_id} Cards: ${gameDeck.game_deck.cards_remain}`);
					if (gameDeck.game_player === 0) CardAPI(1);
					else if (gameDeck.you_cards.length < 2) CardAPI(1);
				}
				else showErrMessage(`Shuffle: ServerReport: success=${data.success}: Err ${data.error}`);
			}
			else {
				// Request DrawCards
				if (data.success) {
					let cards = data.cards;
					gameDeck.game_deck.cards_remain = data.remaining;
					gameDeck.game_deck.cards_drawn += gameDeck.game_draw;
					let i1 = 0;
					let newcard;
					if (gameDeck.game_draw != cards.length) { showErrMessage("Requested number of cards is not returned"); }
					while (i1 < cards.length) {
						gameDeck.AddCardValue(data.cards[i1].value);
						newcard = CreateCard(cards[i1].image);
						if (gameDeck.game_player === 0) dealerCardStack.appendChild(newcard);
						else youCardStack.appendChild(newcard);
						i1++;
					}
					let gamepoints = gameDeck.ShowCardPoints();
					if (gameDeck.game_deck.cards_remain < 20) gameDeck.Shuffle();	// shuffle
					else {
						if (gameDeck.game_player === 0) {
							// Dealer Play
							if (gameDeck.dealer_turn) {
								console.log("-------------- DEALER FINISH GAME: ", gamepoints);
								if (gamepoints < 17) CardAPI(1);	// draw card
								else gameDeck.EndGame();
							}
							else {
								if (gameDeck.dealer_cards.length > 1) {
									gameDeck.game_player = 1;
									CardAPI(1);
								}
							}
						}
						else {
							// You play
							if (gamepoints >= 21) gameDeck.EndGame();
						}
					}

					showMessage(`DeckID: ${gameDeck.game_deck.deck_id} Cards: ${gameDeck.game_deck.cards_remain}`);
				}
				else showErrMessage(`DrawCard: ServerReport: success=${data.success}: Err ${data.error}`);
			}
		})
		.catch((err) => {
			// error handeling - some error
			console.log(err);
			if (gameDeck.retry_count < gameDeck.retry_limit) {
				gameDeck.retry_count++;
//				showErrMessage(`CardsAPI: ${err} ReTry ${gameDeck.retry_count}/${gameDeck.retry_limit}`);
				setTimeout(CardAPI(request), 1000);
			}
			else {
				showErrMessage(`CardsAPI: ${err} Tried ${gameDeck.retry_count} times but could not get a valid response from server`);
				gameDeck.retry_count = 0;
			}
		});


}


//function ShuffleAPI(game) {
//	console.log("-----Call: ShuffleAPI----");
//	showMessage("Shuffling...");

//	// request a new deck of cards OR shuffle
//	let req = null;
//	if (game.game_deck.deck_id === null)
//		req = reqBaseUri + "new/shuffle/?deck_count=" + game.game_deck.decks_count;
//	else
//		req = reqBaseUri + game.game_deck.deck_id + "/shuffle/";
//	console.log(req);
//	console.log(game);

//	fetch(req, {
//		method: 'GET',
//		headers: {
//			'Accept': 'application/json'
//		}
//	})
//		.then(res => res.json())
//		.then(data => {
//			console.log("-----ShuffleAPI-Data----");
//			console.log(data);
//			// here we must handle return data -> update web page
//			console.log(data.success);		// "success": true,
//			console.log(data.deck_id);		// "deck_id": "3p40paa87x90",
//			console.log(data.shuffled);		//  "shuffled": false,
//			console.log(data.remaining);	//	"remaining": 52
//			if (data.success) {
//				game.game_deck.deck_id = data.deck_id;
//				game.game_deck.cards_remain = data.remaining;
//				game.game_deck.cards_drawn = 0;
//				showMessage(`DeckID: ${game.game_deck.deck_id} Cards: ${game.game_deck.cards_remain}`);
//			}
//			else showErrMessage("Game Card Server: success=false");
//			game.ShowCardPoints();
//		})
//		.catch((err) => {
//			// error handeling - some error
//			showErrMessage(`ShuffleCardsErr: ${err}`);
//			console.log(err);
//			console.log(res);
//		});
//}


//function DrawCardsAPI(game) {
//	console.log("-----Call: DrawCardsAPI----");
//	// request a new deck of cards OR shuffle
//	if (game.game_deck.deck_id == null) { showErrMessage("DrawCard on null deck"); return; }
//	if (game.game_draw < 1) { showErrMessage("DrawCard 0 cards"); return;}
//	showMessage("Waiting...");

//	let req = reqBaseUri + game.game_deck.deck_id + "/draw/?count=" + game.game_draw;
//	let player = game.game_player;
//	let playerstack = null;
//	if (player === 0) playerstack = document.querySelector("#DealerCards");
//	else playerstack = document.querySelector("#YourCards");

//	if (player === 0) console.log("PLAYER: DEALER")
//	else if (player === 1) console.log("PLAYER: YOU")
//	else console.log("INVALID PLAYER ID");

//	console.log(player);
//	console.log(req);
//	console.log(game);
//	console.log(playerstack);
//	console.log("------------");

//	fetch(req, {
//		method: 'GET',
//		headers: {
//			'Accept': 'application/json'
//		}
//	})
//		.then(res => res.json())
//		.then(data => {
//			console.log("-----DrawCardsAPI-Data----");
//			console.log(data);
//			// here we must handle return data -> update web page
//			console.log(data.success);		// "success": true,
//			console.log(data.deck_id);		// "deck_id": "3p40paa87x90",
//			console.log(data.remaining);	//	"remaining": 52
//			console.log(data.cards);		//	"cards[]":
//			let cards = data.cards;
//			console.log(cards);				//	"cards[]":
//			if (data.success) {
//				game.game_deck.cards_remain = data.remaining;
//				game.game_deck.cards_drawn += game.game_draw;
//				let i1 = 0;
//				let newcard;
//				if (game.game_draw != cards.length) { showErrMessage("Requested number of cards is not returned"); }
//				while (i1 < game.game_draw) {
//					game.AddCardValue(data.cards[i1].value);
//					newcard = CreateCard(cards[i1].image);
//					playerstack.appendChild(newcard);

//					//	"image": "http://deckofcardsapi.com/static/img/KH.png",
//					//	"value": "KING",
//					//	"suit": "HEARTS",
//					//	"code": "KH"
//					i1++;
//				}
//				showMessage(`DeckID: ${game.game_deck.deck_id} Cards: ${game.game_deck.cards_remain}`);
//				let gamepoints = game.ShowCardPoints();
//				if (game.dealer_turn) {
//					// code here to decide if draw another card or not
//					console.log("-------------- DEALER FINISH GAME: ", gamepoints);
//					if (gamepoints < 17) DrawCardsAPI(game);
//				}
//				if (game.game_deck.cards_remain < 20) gameDeck.Shuffle();
//			}
//			else { showErrMessage("Server Report: success=false"); }
//		})
//		.catch((err) => {
//			// error handeling - some error
//			showErrMessage(`DrawCardErr: ${err}`);
//			console.log(err);
//		});
//}



class CardDeck {
	constructor(decks) {
		if (mydeckid.length > 0) this.deck_id = mydeckid;
		else this.deck_id = null;
		this.decks_count = decks;
		this.cards_count = decks * 52;
		this.cards_drawn = 0;
		this.cards_remain = 0;
	}
	deck_id;
	decks_count;
	cards_count;
	cards_drawn;
	cards_remain;
}


class CardGame {
	constructor(deck) {
		this.game_deck = deck;
		this.game_draw = 0;
		this.game_player = 0;
		this.you_cards = [];
		this.you_wins = 0;
		this.dealer_cards = [];
		this.dealer_wins = 0;
		this.dealer_turn = false;
		this.retry_count = 0;
		this.retry_limit = 3;
	}
	EndGame() {
		btnDraw.hidden = true;
		btnStay.hidden = true;
		btnNewGame.hidden = false;
		let dealer = this.GetCardPoints(0);
		let you = this.GetCardPoints(1);
		if (you > 21) { gameDeck.dealer_wins++; showErrMessage(`You loose - (You: ${gameDeck.you_wins}   Dealer: ${gameDeck.dealer_wins})`); }
		else if (dealer > 21) { gameDeck.you_wins++; showErrMessage(`You Win - (You: ${gameDeck.you_wins}   Dealer: ${gameDeck.dealer_wins})`);  }
		else if (dealer >= you) { gameDeck.dealer_wins++;  showErrMessage(`Dealer Win - (You: ${gameDeck.you_wins}   Dealer: ${gameDeck.dealer_wins})`); }
		else { gameDeck.you_wins++; showErrMessage(`You Win - (You: ${gameDeck.you_wins}   Dealer: ${gameDeck.dealer_wins})`); }
	}
	GetCardPoints(playerid) {
		// Count points
		let i1 = 0; let sum = 0; let aces = 0; let sum2 = 0;
		if (playerid == 0) {
			while (i1 < gameDeck.dealer_cards.length) { if (gameDeck.dealer_cards[i1] == 1) aces++; sum += gameDeck.dealer_cards[i1++]; }
		}
		else {
			while (i1 < gameDeck.you_cards.length) { if (gameDeck.you_cards[i1] == 1) aces++; sum += gameDeck.you_cards[i1++]; }
		}
		if (aces > 0) {
			sum2 = sum + 10;
			if (sum2 <= 21) sum = sum2;
			if (aces >= 2) {
				sum2 = sum + 20;
				if (sum2 <= 21) sum = sum2;
			}
		}
		return sum;
	}
	ShowCardPoints() {
		// Count points
		let sum = this.GetCardPoints(this.game_player);
		if (this.game_player == 0) {
			showDealerMessage(`Dealer points: ${sum}`);
			if (sum > 21) showDealerMessage(`Dealer - THICK !`);
			else if (sum === 21) showDealerMessage(`BLACK JACK!`);
		}
		else {
			showYouMessage(`Your points: ${sum}`);
			if (sum > 21) showYouMessage(`You - THICK !`);
			else if (sum == 21) showYouMessage(`BLACK JACK!`);
		}
		return sum;
	}
	Player(playerid) { this.game_player = playerid; }
	DealerFinish() {
		this.game_player = 0;
		this.dealer_turn = true;	// play to end of game
		if (this.GetCardPoints(0) < 17) this.DrawCard(1);
		else this.EndGame();

	}
	NewRound() {
		console.log("-------------- NEW ROUND --------")
		console.log("Cookie:", document.cookie);
		let i1 = 0;
		btnDraw.hidden = false;
		btnStay.hidden = false;
		btnNewGame.hidden = true;
		showSuccessMessage("");
		showDealerMessage("");
		showYouMessage("");
		let DC = document.querySelector("#DealerCards");
		while (DC.childNodes.length > 0) {
			DC.childNodes[0].remove();
		}
		let YC = document.querySelector("#YourCards");
		while (YC.childNodes.length > 0) {
			YC.childNodes[0].remove();
		}
		this.you_cards = [];
		this.dealer_cards = [];
		this.game_player = 1;
		this.dealer_turn = false;
		console.log(this.game_deck.deck_id);
		console.log(this.game_deck.cards_remain);
		if (this.game_deck.cards_remain < 20) CardAPI(0);	// shuffle
		else CardAPI(1);	// draw card
	}
	Shuffle() {	CardAPI(0); }
	DrawCard() { CardAPI(1); }
	AddCardValue(card) {
		let cardvalue = 0;
		switch (card) {
			case "2": cardvalue = 2; break;
			case "3": cardvalue = 3; break;
			case "4": cardvalue = 4; break;
			case "5": cardvalue = 5; break;
			case "6": cardvalue = 6; break;
			case "7": cardvalue = 7; break;
			case "8": cardvalue = 8; break;
			case "9": cardvalue = 9; break;
			case "10": cardvalue = 10; break;
			case "JACK": cardvalue = 10; break;
			case "QUEEN": cardvalue = 10; break;
			case "KING": cardvalue = 10; break;
			case "ACE": cardvalue = 1; break;
			default:
				console.log("-------UNHANDELED CARD --------");
				console.log(card);
				break;
		}
		if (this.game_player === 0) this.dealer_cards.push(cardvalue);
		else this.you_cards.push(cardvalue);
	}
}

cardDeck = new CardDeck(6);
gameDeck = new CardGame(cardDeck);
showMessage("Start A New BlackJack Game!");


