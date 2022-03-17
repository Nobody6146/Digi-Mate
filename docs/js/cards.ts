//type DigimonTradingCardType = "Digimon" | "Digi-Egg" | "Option" | "Tamer";
//type DigimonTradingCardColor = "Red" | "Blue" | "Yellow" | "Green" | "White" | "Black" | "Purple";
class DigimonTradingCardEnums
{
    types:string[] = [];
    colors:string[] = [];
    attributes:string[] = [];
    forms:string[] = [];
    rarities:string[] = [];
    digimonTypes:string[] = [];
    effects:DigimonTradingCardEffect[] = [];
    abilities:DigimonTradingCardAbility[] = [];
    sets:DigimonTradingCardSet[] = [];
    setNumbers:string[] = [];
    setNames:string[] = [];    
}

class DigimonTradingCardStats
{
    playCost:DigimonStatRange;
    levels:DigimonStatRange;
    evolutionCost:DigimonStatRange;
    dp:DigimonStatRange;
    rarityValue:DigimonStatRange;
    numberOfAbilities:DigimonStatRange;
    numberOfEffects:DigimonStatRange;
    digiScore:DigimonStatRange;

    constructor() {
        this.playCost = new DigimonStatRange();
        this.levels = new DigimonStatRange();
        this.evolutionCost = new DigimonStatRange();
        this.dp = new DigimonStatRange();
        this.rarityValue = new DigimonStatRange();
        this.numberOfAbilities = new DigimonStatRange();
        this.numberOfEffects = new DigimonStatRange();
        this.digiScore = new DigimonStatRange();
    }
}

class DigimonTradingCardEvaluation {
    playCost:number = 0;
    level:number = 0;
    evolutionCost:number = 0;
    dp:number = 0;
    rarityValue:number = 0;
    numberOfAbilities:number = 0;
    numberOfEffects:number = 0;
    cardType:number = 0;

    digiScore:number = 0;
}

class DigimonStatRange {
    min:number = null;
    max:number = null;

    update(value:number){
        this.updateMin(value);
        this.updateMax(value);
    }
    updateMin(value:number):number {
        if(value == null)
            return this.min;
        if(this.min == null || value < this.min)
            this.min = value;
        return this.min;
    }
    updateMax(value:number):number {
        if(value == null)
            return this.max;
        if(this.max == null || value > this.max)
            this.max = value;
        return this.max;
    }
}

class DigimonTradingCardEffect {
    name:string;
    text:string;
}

class DigimonTradingCardAbility {
    name:string;
    text:string;
    x:number;
}

class DigimonTradingCardSet {
    name:string;
    number:string;
}

class DigimonTradingCardRarity {
    name:string;
    symbol:string;
}

class DigimonTradingCard
{
    name: string;
    type: string;
    color: string;
    form:string; 
    attribute:string; 
    level:number; 
    playCost:number; 
    evolutionCost:number; 
    rarity:string;
    rarityValue:number;
    artist:string; 
    dp:number; 
    digimonType:string; 
    number:string; 
    primaryText:string;
    secondaryText:string;
    effects: DigimonTradingCardEffect[];
    abilities: DigimonTradingCardAbility[];
    set:DigimonTradingCardSet; 
    printings: DigimonTradingCardSet[];
    imageUrl:string;
    fullText:string;
}

class EvaluatedDigimonTradingCard extends DigimonTradingCard
{
    evaluation:DigimonTradingCardEvaluation;
}

type DigimonTradingCardDetail = DigimonTradingCard;

class DigimonTradingCardEvaluator
{
    static evaluateDatabase(cards:DigimonTradingCard[])
    {
        let cardEnums = new DigimonTradingCardEnums(); 
        let cardStats = new DigimonTradingCardStats();  
        cards.forEach(card => {
            if(cardEnums.types.find(x => x === card.type) === undefined)
                cardEnums.types.push(card.type);
            if(cardEnums.colors.find(x => x === card.color) === undefined)
                cardEnums.colors.push(card.color);
            if(cardEnums.attributes.find(x => x === card.attribute) === undefined)
                cardEnums.attributes.push(card.attribute);
            if(cardEnums.forms.find(x => x === card.form) === undefined)
                cardEnums.forms.push(card.form);
            if(cardEnums.rarities.find(x => x === card.rarity) === undefined)
                cardEnums.rarities.push(card.rarity);
            if(cardEnums.digimonTypes.find(x => x === card.digimonType) === undefined)
                cardEnums.digimonTypes.push(card.digimonType);
            card.effects.forEach(effect => {
                if(cardEnums.effects.find(x => x.name === effect.name) === undefined)
                    cardEnums.effects.push(effect);
            });
            card.abilities.forEach(ability => {
                if(cardEnums.abilities.find(x => x.name === ability.name) === undefined)
                    cardEnums.abilities.push(ability);
            });
            if(cardEnums.sets.find(x => x.number === card.set.number) === undefined)
                cardEnums.sets.push(card.set);
            card.printings.forEach(printing => {
                if(cardEnums.sets.find(x => x.number === printing.number) === undefined)
                    cardEnums.sets.push(printing);
            })

            cardStats.playCost.update(card.playCost);
            cardStats.levels.update(card.level);
            cardStats.evolutionCost.update(card.evolutionCost);
            cardStats.dp.update(card.dp);
            cardStats.rarityValue.update(card.rarityValue);
            cardStats.numberOfAbilities.update(card.abilities.length);
            cardStats.numberOfEffects.update(card.effects.length);
        });

        cardEnums.types = cardEnums.types.sort();
        cardEnums.colors = cardEnums.colors.sort();
        cardEnums.attributes = cardEnums.attributes.sort();
        cardEnums.forms = cardEnums.forms.sort();
        cardEnums.rarities = cardEnums.rarities.sort();
        cardEnums.digimonTypes = cardEnums.digimonTypes.sort();
        cardEnums.effects = cardEnums.effects.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.abilities = cardEnums.abilities.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.sets = cardEnums.sets.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.setNames = cardEnums.sets.map(x => x.name).sort();
        cardEnums.setNumbers = cardEnums.sets.map(x => x.number);

        let evaluatedCards:EvaluatedDigimonTradingCard[] = cards.map(card => {
            return {
                ...card,
                evaluation: this.#evaluateCard(card, cardStats)
            }
        });

        return {
            cardEnums,
            cardStats,
            evaluatedCards
        };
    }

    static #evaluateCard(card:DigimonTradingCard, cardStats:DigimonTradingCardStats):DigimonTradingCardEvaluation
    {
        let evaluation = new DigimonTradingCardEvaluation();
        evaluation.playCost = this.#evaluateStat(card.playCost, cardStats.playCost.max, cardStats.playCost.min);
        evaluation.level = this.#evaluateStat(card.level, cardStats.levels.min, cardStats.levels.max);
        evaluation.evolutionCost = this.#evaluateStat(card.evolutionCost, cardStats.evolutionCost.max, cardStats.evolutionCost.min);
        evaluation.dp = this.#evaluateStat(card.dp, cardStats.dp.min, cardStats.dp.max);
        evaluation.rarityValue = this.#evaluateStat(card.rarityValue, cardStats.rarityValue.min, cardStats.rarityValue.max);
        evaluation.numberOfAbilities = this.#evaluateStat(card.abilities.length, cardStats.numberOfAbilities.min, cardStats.numberOfAbilities.max);
        evaluation.numberOfEffects = this.#evaluateStat(card.effects.length, cardStats.numberOfEffects.min, cardStats.numberOfEffects.max);
        evaluation.cardType = card.type === "Digimon" ? 0 : 20;
        evaluation.digiScore = Math.round(evaluation.playCost
            + evaluation.level
            + evaluation.evolutionCost 
            + evaluation.dp 
            + evaluation.rarityValue 
            + evaluation.numberOfAbilities 
            + evaluation.numberOfEffects
            + evaluation.cardType); 
        cardStats.digiScore.update(evaluation.digiScore);

        return evaluation;
    }

    static #evaluateStat(value:number, min:number, max:number)
    {
        if(value == null)
            return 0;
        let weight = max - min;
        return (1 - (max - value)/weight) * 10;
    }
}