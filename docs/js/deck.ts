class DigimonTradingCardDeck {

    eggDeck:DigimonTradingCardEggDeckPart;
    mainDeck:DigimonTradingCardMainDeckPart;
    sideDeck:DigimonTradingCardSideDeckPart;

    constructor() {
        this.eggDeck = new DigimonTradingCardEggDeckPart();
        this.mainDeck = new DigimonTradingCardMainDeckPart();
        this.sideDeck = new DigimonTradingCardSideDeckPart();

        this.mainDeck.add(App.cards.get("BT2-047"), 1);
        this.mainDeck.add(App.cards.get("ST2-04"), 2);
        this.mainDeck.add(App.cards.get("ST6-09"), 2);
        this.eggDeck.add(App.cards.get("BT2-004"), 2);

        
        //This bad deck contents
        this.mainDeck.add(App.cards.get("BT1-100"), 4);
        this.mainDeck.add(App.cards.get("BT5-109"), 1);
        this.eggDeck.add(App.cards.get("BT1-100"), 1);
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
    name:string;
    allowedCardTypes:string[];
    categories:DigimonTradingCardDeckPartCategory[]
    minSize:number;
    maxSize:number;
    unknownCards:EvaluatedDigimonTradingCard[];

    constructor(name:string, minSize:number, maxSize:number, allowedCardTypes:string[], categories:DigimonTradingCardDeckPartCategory[])
    {
        this.name = name;
        this.minSize = minSize;
        this.maxSize = maxSize;
        this.allowedCardTypes = allowedCardTypes;
        this.categories = categories.concat(
            new DigimonTradingCardDeckPartCategory("Invalid", card => true)
        );
        this.unknownCards = [];
    }

    get cardCount():number {
        return this.categories.reduce((total, category) => total + category.cardCount, 0);
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

    add(card:EvaluatedDigimonTradingCard, copies:number = 1):DigimonTradingCardDeckSpot {
        for(let category of this.categories)
        {
            if(!category.criteria(card))
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

    constructor(name:string, criteria:DigimonTradingCardDeckPartCategoryCriteria) {
        this.name = name;
        this.criteria = criteria;
        this.deckSpots = [];
    }
    
    get cardCount():number {
        return this.deckSpots.reduce((sum, spot) => sum + spot.copies, 0);
    } 
}

class DigimonTradingCardEggDeckPart extends DigimonTradingCardDeckPart
{
    constructor()
    {
        super("Egg", 0, 4, ["Digi-Egg"], [
            new DigimonTradingCardDeckPartCategory("Level 2s", card => card.level == 2)
        ]);
    }
}

class DigimonTradingCardMainDeckPart extends DigimonTradingCardDeckPart
{
    constructor()
    {
        super("Main", 50, 50, ["Digimon", "Option", "Tamer"], [
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
        super("Side", 0, 10, ["Digi-Egg", "Digimon", "Option", "Tamer"], [
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

    constructor(card:EvaluatedDigimonTradingCard, copies:number = 0)
    {
        this.card = card;
        this.copies = copies;
    }
}