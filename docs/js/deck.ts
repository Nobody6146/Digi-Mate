class DigimonTradingCardDeck {

    eggDeck:DigimonTradingCardEggDeckPart;
    mainDeck:DigimonTradingCardMainDeckPart;
    sideDeck:DigimonTradingCardSideDeckPart;
    stats:DigimonTradingCardDecksStats;

    constructor() {
        this.eggDeck = new DigimonTradingCardEggDeckPart();
        this.mainDeck = new DigimonTradingCardMainDeckPart();
        this.sideDeck = new DigimonTradingCardSideDeckPart();
        this.stats = new DigimonTradingCardDecksStats();

        //Test seeded data
        // this.mainDeck.add(App.cards.get("BT2-047"), 1);
        // this.mainDeck.add(App.cards.get("ST2-04"), 2);
        // this.mainDeck.add(App.cards.get("ST6-09"), 2);
        // this.eggDeck.add(App.cards.get("BT2-004"), 2);

        
        //This bad deck contents
        // this.mainDeck.add(App.cards.get("BT1-100"), 4);
        // this.mainDeck.add(App.cards.get("BT5-109"), 1);
        // this.eggDeck.add(App.cards.get("BT1-100"), 1);
    }

    get digiScore():number {
        return this.eggDeck.digiScore + this.mainDeck.digiScore + this.sideDeck.digiScore;
    }

    get deckScore():number {
        return this.eggDeck.deckScore + this.mainDeck.deckScore + this.sideDeck.deckScore;
    }

    get cardCount():number {
        return this.eggDeck.cardCount + this.mainDeck.cardCount + this.sideDeck.cardCount;
    }

    get errors():string[] {
        let errors:string[] = this.eggDeck.errors
            .concat(this.mainDeck.errors)
            .concat(this.sideDeck.errors);
        let cardCounts:Map<string, {card:EvaluatedDigimonTradingCard, copies:number}> = new Map();
        this.eggDeck.categories
            .concat(this.mainDeck.categories)
            .concat(this.sideDeck.categories)
            .forEach(category => {
                category.deckSpots.forEach(spot => {
                    let count = cardCounts.get(spot.card.number);
                    if(count === undefined)
                    {
                        count = {card: spot.card, copies: 0};
                        cardCounts.set(spot.card.number, count);
                    }
                    count.copies += spot.copies;
                })
            });
        [...cardCounts.values()].forEach(spot => {
            if(spot.copies > spot.card.copiesAllowed)
                errors.push(`Deck: ${spot.card.name} ${spot.card.number} is ${spot.card.legality} and you are only allowed ${spot.card.copiesAllowed} copies`);
        });
        return errors;
    }

    get legal():boolean {
        return this.errors.length === 0;
    }
}

type DigimonTradingCardDeckPartType = "egg" | "main" | "side";

class DigimonTradingCardDeckPart
{
    deckType:DigimonTradingCardDeckPartType;
    name:string;
    allowedCardTypes:string[];
    categories:DigimonTradingCardDeckPartCategory[]
    minSize:number;
    maxSize:number;
    unknownCards:EvaluatedDigimonTradingCard[];

    constructor(name:string, deckType:DigimonTradingCardDeckPartType, minSize:number, maxSize:number, allowedCardTypes:string[], categories:DigimonTradingCardDeckPartCategory[])
    {
        this.deckType = deckType;
        this.name = name;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.allowedCardTypes = allowedCardTypes;
        this.categories = categories.concat(
            new DigimonTradingCardDeckPartCategory("Invalid", null)
        );
        this.unknownCards = [];
    }

    get digiScore():number {
        return this.categories.reduce((total, category) => total + category.digiScore, 0);
    }

    get deckScore():number {
        return this.categories.reduce((total, category) => total + category.deckScore, 0);
    }

    get cardCount():number {
        return this.categories.reduce((total, category) => total + category.cardCount, 0);
    }

    get cards():EvaluatedDigimonTradingCard[] {
        return this.categories.flatMap(category => category.cards);
    }

    get errors():string[] {
        let errors:string[] = [];
        if(this.cardCount < this.minSize)
            errors.push("Card count is less than the min");
        if(this.cardCount > this.maxSize)
            errors.push("Card count is greater than the max");
        this.categories.forEach(category => {
            category.deckSpots.forEach(spot => {
                let name = `${spot.card.name} ${spot.card.number}`;
                if(this.allowedCardTypes.find(x => x === spot.card.type) === undefined)
                    errors.push(`${name} is not an allowed card type for this deck`);
                if(spot.copies > spot.card.copiesAllowed)
                    errors.push(`${name} is ${spot.card.legality} and you are only allowed ${spot.card.copiesAllowed} copies`);
            });
        })
        this.unknownCards.forEach(card => {
            let name = `${card.name} ${card.number}`;
            errors.push(`${name} is either an unknown card or does not meet the criteria to fit the deck`);
        });
        return errors.map(error => `${this.name} Deck: ${error}`);
    }

    get legal():boolean {
        return this.errors.length === 0;
    }

    get activeCategories() {
        return this.categories.filter(category => category.cardCount > 0);
    }

    get deckSpots() {
        return this.activeCategories.flatMap(x => x.deckSpots);
    }

    add(card:EvaluatedDigimonTradingCard, copies:number = 1):DigimonTradingCardDeckSpot {
        for(let category of this.categories)
        {
            if(category.criteria == null || !category.criteria(card))
                continue;
            let spot = category.deckSpots.find(x => x.card.number === card.number);
            if(spot == null)
            {
                spot = new DigimonTradingCardDeckSpot(card);
                category.deckSpots.push(spot);
            }
            spot.copies += copies;
            return spot;
        }
        return undefined;
    }
}

type DigimonTradingCardDeckPartCategoryCriteria = (x:EvaluatedDigimonTradingCard) => boolean;

class DigimonTradingCardDeckPartCategory {
    name:string;
    criteria:DigimonTradingCardDeckPartCategoryCriteria;
    deckSpots:DigimonTradingCardDeckSpot[];
    cardStats:DigimonTradingCardStats;

    constructor(name:string, criteria:DigimonTradingCardDeckPartCategoryCriteria) {
        this.name = name;
        this.criteria = criteria;
        this.deckSpots = [];
        this.cardStats = null;
    }
    
    get digiScore():number {
        return this.deckSpots.reduce((sum, spot) => sum + spot.digiScore, 0);
    }

    get deckScore():number {
        return this.deckSpots.reduce((sum, spot) => sum + spot.deckScore, 0);
    }

    get cards():EvaluatedDigimonTradingCard[] {
        let cards:EvaluatedDigimonTradingCard[] = [];
        this.deckSpots.forEach(spot => {
            for(let i = 0; i < spot.copies; i++)
                cards.push(spot.card);
        });
        return cards;
    }

    get cardCount():number {
        return this.deckSpots.reduce((sum, spot) => sum + spot.copies, 0);
    } 
}

class DigimonTradingCardEggDeckPart extends DigimonTradingCardDeckPart
{
    constructor()
    {
        super("Egg", "egg", 0, 5, ["Digi-Egg"], [
            new DigimonTradingCardDeckPartCategory("Level 2s", card => card.level == 2)
        ]);
    }
}

class DigimonTradingCardMainDeckPart extends DigimonTradingCardDeckPart
{
    constructor()
    {
        super("Main", "main", 50, 50, ["Digimon", "Option", "Tamer"], [
            new DigimonTradingCardDeckPartCategory("Level 3s", card => card.level == 3),
            new DigimonTradingCardDeckPartCategory("Level 4s", card => card.level == 4),
            new DigimonTradingCardDeckPartCategory("Level 5s", card => card.level == 5),
            new DigimonTradingCardDeckPartCategory("Level 6s", card => card.level == 6),
            new DigimonTradingCardDeckPartCategory("Level 7s", card => card.level == 7),
            new DigimonTradingCardDeckPartCategory("Tamers", card => card.type === "Tamer"),
            new DigimonTradingCardDeckPartCategory("Options", card => card.type === "Option")
        ]);
    }
}

class DigimonTradingCardSideDeckPart extends DigimonTradingCardDeckPart
{
    constructor()
    {
        super("Side", "side", 0, 10, ["Digi-Egg", "Digimon", "Option", "Tamer"], [
            new DigimonTradingCardDeckPartCategory("Level 2", card => card.level == 2),
            new DigimonTradingCardDeckPartCategory("Level 3s", card => card.level == 3),
            new DigimonTradingCardDeckPartCategory("Level 4s", card => card.level == 4),
            new DigimonTradingCardDeckPartCategory("Level 5s", card => card.level == 5),
            new DigimonTradingCardDeckPartCategory("Level 6s", card => card.level == 6),
            new DigimonTradingCardDeckPartCategory("Level 7s", card => card.level == 7),
            new DigimonTradingCardDeckPartCategory("Tamers", card => card.type === "Tamer"),
            new DigimonTradingCardDeckPartCategory("Options", card => card.type === "Option")
        ]);
    }
}

class DigimonTradingCardDeckSpot
{
    card:EvaluatedDigimonTradingCard;
    copies:number;
    evaluation:DigimonTradingCardEvaluation;

    constructor(card:EvaluatedDigimonTradingCard, copies:number = 0)
    {
        this.card = card;
        this.copies = copies;
        this.evaluation = null;
    }

    get digiScore():number {
        return this.card.evaluation.digiScore * this.copies;
    }

    get deckScore():number {
        return this.evaluation.digiScore * this.copies;
    }
}

class DigimonTradingCardDecksStats extends DigimonTradingCardStats {
    deckScore:DigimonStatRange;

    constructor() {
        super();
        this.deckScore = new DigimonStatRange();
    }

    updateDeckScore(score:number): void {
        this.deckScore.update(score);
    }
}

class DigimonTradingCardDeckEvaluator {
    static evaluateDeck(deck:DigimonTradingCardDeck) {
        deck.eggDeck.activeCategories
        .concat(deck.mainDeck.activeCategories)
        .concat(deck.sideDeck.activeCategories)
        .forEach(category => {
            if(category.criteria == null)
            {
                category.cardStats = App.hydrate.state(App.cardDatabase.cardStats);
            }
            else
            {
                category.cardStats = new DigimonTradingCardStats();
                [...App.cards.values()].forEach(card => {
                    if(!category.criteria(card))
                        return;
                    category.cardStats.update(card);
                });
            }
            
            category.deckSpots.forEach(spot => {
                spot.evaluation = DigimonTradingCardEvaluator.evaluateCard(spot.card, category.cardStats);
            });
        });

        deck.stats = new DigimonTradingCardDecksStats();
        deck.eggDeck.activeCategories
            .concat(deck.mainDeck.activeCategories)
            .concat(deck.sideDeck.activeCategories)
            .forEach(category => {
                category.deckSpots.forEach(spot => {
                    for(let i = 0; i < spot.copies; i++) {
                        deck.stats.update(spot.card);
                        deck.stats.digiScore.update(spot.card.evaluation.digiScore);
                        deck.stats.updateDeckScore(spot.evaluation.digiScore);
                    }
                });
            });
        return deck;
    }
}