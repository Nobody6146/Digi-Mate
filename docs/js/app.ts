class KeyValuePair<T, U> {
    key:T;
    value:U;

    constructor(key:T, value:U)
    {
        this.key = key;
        this.value = value;
    }
}

class HydrateModelKeys
{
    static cardDatabase = "cardDatabase";
    static search = "search";
    static deck = "deck";
}

class AppCardDatabase {
    cards:EvaluatedDigimonTradingCard[];
    cardEnums:DigimonTradingCardEnums;
    cardStats:DigimonTradingCardStats;
}

class AppCardDatabaseQueryResult {
    query:string;
    filter:Function;
    results:EvaluatedDigimonTradingCard[];

}

type SearchParameterConditionType = "equal" | "notEqual" | "lessThan" | "greaterThan" | "lessThanOrEqual" | "greaterThanOrEqual" | "match" | "notMatch";
type SearchParameterTemplateType = "TextSearchTemplate" | "NumberSearchTemplate" | "SelectSearchTemplate";
type SearchParameterType = "cardName" | "fullText" | "cardType" | "attribute" | "color" | "form" | "level" | "playCost"
    | "evolutionCost" | "rarity" | "artist" | "dp" | "digimonType" | "number" | "effect" | "ability" | "setName"
    | "setNumber" | "printingName" | "printingNumber" | "legality" | "copiesAllowed" |  "digiScore" | "evalPlay" | "evalEvolve" 
    | "evalDp" | "evalEffects" | "evalAbilities" | "evalLevel" | "evalRarity";
type SearchCardFieldFunction = (x:EvaluatedDigimonTradingCard) => any;
type SearchFindFieldFunction = (x:DigimonTradingCardEffect | DigimonTradingCardAbility | DigimonTradingCardSet) => any;

class AppSearch {
    static searchableParameters:Map<SearchParameterType, SearchParameter> = new Map();
    parameters:AppSearchParameters;
    results:EvaluatedDigimonTradingCard[];
    sortField:SearchParameterType;
    sortOrder:string;
    query:string = null;

    constructor() {
        let enums = <DigimonTradingCardEnums> App.hydrate.state(App.cardDatabase.cardEnums);
        const mockCard = new EvaluatedDigimonTradingCard();
        const mockEffect = new DigimonTradingCardEffect();
        const mockAbility = new DigimonTradingCardAbility();
        const mockSet = new DigimonTradingCardSet();

        let avaliableParameters:SearchParameter[] = [];
        avaliableParameters.push(new TextSearchParameter("cardName", mockCard => mockCard.name, null, "Card Name", "Any words in the name, e.g. Agumon"));
        avaliableParameters.push(new TextSearchParameter("fullText", mockCard => mockCard.fullText, null, "Text", "Any words in the name, e.g. trash, Digimon, etc."));
        avaliableParameters.push(new SelectSearchParameter("cardType", mockCard => mockCard.type, null, "Card Type", enums.types.map(type => new KeyValuePair(type, type))));
        avaliableParameters.push(new SelectSearchParameter("attribute", mockCard => mockCard.attribute, null, "Attribute", enums.attributes.map(attribute => new KeyValuePair(attribute, attribute))));
        avaliableParameters.push(new SelectSearchParameter("color", mockCard => mockCard.color, null, "Color", enums.colors.map(color => new KeyValuePair(color, color))));
        avaliableParameters.push(new SelectSearchParameter("form", mockCard => mockCard.form, null, "Form", enums.forms.map(form => new KeyValuePair(form, form))));
        avaliableParameters.push(new NumberSearchParameter("level", mockCard => mockCard.level, null, "Level", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("playCost", mockCard => mockCard.playCost, null, "Play Cost", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evolutionCost", mockCard => mockCard.evolutionCost, null, "Evolution Cost", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new SelectSearchParameter("rarity", mockCard => mockCard.rarity, null, "Rarity", enums.rarities.map(rarity => new KeyValuePair(rarity, rarity))));
        avaliableParameters.push(new TextSearchParameter("artist", mockCard => mockCard.artist, null, "Artist", "Any words in the name, e.g. shosuke"));
        avaliableParameters.push(new NumberSearchParameter("dp", mockCard => mockCard.dp, null, "DP", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new SelectSearchParameter("digimonType", mockCard => mockCard.digimonType, null, "Digimon Type", enums.digimonTypes.map(type => new KeyValuePair(type, type)))); 
        avaliableParameters.push(new TextSearchParameter("number", mockCard => mockCard.number, null, "Card Number", "Any words in the name, e.g. BT1-041"));
        avaliableParameters.push(new SelectSearchParameter("effect", mockCard => mockCard.effects, mockEffect => mockEffect.name, "Effect", enums.effects.map(effect => new KeyValuePair(effect.name, effect.name))));
        avaliableParameters.push(new SelectSearchParameter("ability", mockCard => mockCard.abilities, mockAbility => mockAbility.name, "Ability", enums.abilities.map(ability => new KeyValuePair(ability.name, ability.name))));
        avaliableParameters.push(new SelectSearchParameter("setName", mockCard => mockCard.set.name, null, "Set Name", enums.setNames.map(name => new KeyValuePair(name, name))));
        avaliableParameters.push(new SelectSearchParameter("setNumber", mockCard => mockCard.set.number, null, "Set Number", enums.setNumbers.map(num => new KeyValuePair(num, num))));
        avaliableParameters.push(new SelectSearchParameter("printingName", mockCard => mockCard.printings, mockSet => mockSet.name, "Printing Name", enums.setNames.map(name => new KeyValuePair(name, name))));
        avaliableParameters.push(new SelectSearchParameter("printingNumber", mockCard => mockCard.printings, x => mockSet.number, "Printing Number", enums.setNumbers.map(num => new KeyValuePair(num, num))));
        avaliableParameters.push(new SelectSearchParameter("legality", mockCard => mockCard.legality, null, "Card Legality", enums.legalities.map(legality => new KeyValuePair(legality, legality))));
        avaliableParameters.push(new NumberSearchParameter("copiesAllowed", mockCard => mockCard.copiesAllowed, null, "# of Copies Allowed", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("digiScore", mockCard => mockCard.evaluation.digiScore, null, "Digi-Score", "Any numerical value, e.g. 31"));
        avaliableParameters.push(new NumberSearchParameter("evalAbilities", mockCard => mockCard.evaluation.numberOfAbilities, null, "Evaluation of Abilities", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalDp", mockCard => mockCard.evaluation.dp, null, "Evaluation of DP", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalEffects", mockCard => mockCard.evaluation.numberOfEffects, null, "Evaluation of Effects", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalEvolve", mockCard => mockCard.evaluation.evolutionCost, null, "Evaluation of Evolution", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalLevel", mockCard => mockCard.evaluation.level, null, "Evaluation of Level", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalPlay", mockCard => mockCard.evaluation.playCost, null, "Evaluation of Cost", "Any numerical value, e.g. 3"));
        avaliableParameters.push(new NumberSearchParameter("evalRarity", mockCard => mockCard.evaluation.rarityValue, null, "Evaluation of Rarity", "Any numerical value, e.g. 3"));
        
        AppSearch.searchableParameters.clear();
        avaliableParameters.forEach(type => AppSearch.searchableParameters.set(type.parameterType, type));

        this.parameters = new AppSearchParameters();
        this.results = [];
        this.sortField = "cardName";
        this.sortOrder = "asc";
    }
}

class AppSearchParameters {
    availableParameters:SearchParameter[];
    list:SearchParameter[] = [];
    addParameterType:SearchParameterType = null;

    constructor() {
        this.availableParameters = [...AppSearch.searchableParameters.values()]
            .map(parameter => AppSearchParameters.copy(parameter))
            .sort((x, y) => x.fieldName < y.fieldName ? -1 : 1);
        // this.list = [...AppSearch.searchableParameters.values()]
        //     .map(parameter => AppSearchParameters.copy(parameter));
        
    }

    static copy(parameter:SearchParameter):SearchParameter
    {
        let result:SearchParameter = JSON.parse(JSON.stringify(parameter));
        result.fieldFunction = parameter.fieldFunction;
        result.findFieldFunction = parameter.findFieldFunction;
        return result;
    }
}

class SearchParameter {
    fieldName:string;
    parameterType:SearchParameterType;
    templateType:SearchParameterTemplateType;
    fieldFunction:SearchCardFieldFunction;
    findFieldFunction:SearchFindFieldFunction;
    //paramName:string;
    placeholder:string;
    value:string;
    availableConditions:KeyValuePair<string, SearchParameterConditionType>[];
    condition:SearchParameterConditionType;

    constructor(templateType:SearchParameterTemplateType, parameterType:SearchParameterType, fieldFunction:SearchCardFieldFunction,
        findFieldFunction:SearchFindFieldFunction, fieldName:string, placeHolder:string, value:string = "", condition:SearchParameterConditionType = "equal") {
        this.templateType = templateType;
        this.fieldName = fieldName;
        this.parameterType = parameterType;
        this.fieldFunction = fieldFunction;
        this.findFieldFunction = findFieldFunction;
        //this.paramName = this.fieldName.replace(" ", "").toLowerCase();
        this.placeholder = placeHolder;
        this.value = value;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("<", "lessThan"),
            new KeyValuePair("<=", "lessThanOrEqual"),
            new KeyValuePair(">", "greaterThan"),
            new KeyValuePair(">=", "greaterThanOrEqual"),
            new KeyValuePair("Includes", "match"),
            new KeyValuePair("Excludes", "notMatch"),
        ];
        this.condition = condition;
    }
}

class TextSearchParameter extends SearchParameter {
    constructor(parameterType:SearchParameterType, fieldFunction:SearchCardFieldFunction,
        findFieldFunction:SearchFindFieldFunction, fieldName:string, placeHolder:string, value:string = "")
    {
        super("TextSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value, "match");
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("Includes", "match"),
            new KeyValuePair("Excludes", "notMatch"),
        ];
    }
}

class NumberSearchParameter extends SearchParameter {
    constructor(parameterType:SearchParameterType, fieldFunction:SearchCardFieldFunction,
        findFieldFunction:SearchFindFieldFunction, fieldName:string, placeHolder:string, value:string = "")
    {
        super("NumberSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value, "equal");
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("<", "lessThan"),
            new KeyValuePair("<=", "lessThanOrEqual"),
            new KeyValuePair(">", "greaterThan"),
            new KeyValuePair(">=", "greaterThanOrEqual"),
        ];
    }
}

class SelectSearchParameter extends SearchParameter {
    options:KeyValuePair<string,string>[];
    constructor(parameterType:SearchParameterType, fieldFunction:SearchCardFieldFunction,
        findFieldFunction:SearchFindFieldFunction, fieldName:string, options:KeyValuePair<string,string>[], value:string = "")
    {
        super("SelectSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, "", value, "equal");
        this.options = options;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual")
        ];
    }
}

class AppDeck {
    name:string;
    list:DigimonTradingCardDeck;
    parameters:DeckParameter[];

    constructor() {
        this.name = "New Deck";
        this.list = new DigimonTradingCardDeck();
        this.parameters = [
            new DeckParameter("egg"),
            new DeckParameter("main"),
            new DeckParameter("side")
        ];
    }
}

class DeckParameter {
    text:string;
    deckPartType:DigimonTradingCardDeckPartType;
    name:string;

    constructor(type:DigimonTradingCardDeckPartType, text:string = "")
    {
        this.deckPartType = type;
        switch(this.deckPartType)
        {
            case "egg":
                this.name = "Egg Deck";
                break;
            case "main":
                this.name = "Main Deck";
                break;
            case "side":
                this.name = "Side Deck";
                break;
        }
        this.text = text;
    }
}

class DeckParameterCard {
    cardNumber:string;
    copies:number;
}

function logError(error:Error):void {
    console.error(error);
    alert(error.message);
}

class App
{
    static #hydrate:HydrateApp;
    static #cards:Map<string, EvaluatedDigimonTradingCard>;

    static get hydrate() {
        return this.#hydrate;
    }

    static async start(): Promise<void> {
        let options = new HydrateAppOptions();
        this.#hydrate = new HydrateApp(options);
        this.#cards = new Map();
        await this.loadDatabase();
        this.initializeUi();

        App.hydrate.route("#search", (req, res) => {
            this.handleSearchQuery(req);
            res.resolve();
        });
        App.hydrate.route("#card", (req, res) => {
            res.resolve();
        });
        App.hydrate.route("#cards", (req, res) => {
            this.handleSearchQuery(req);
            res.resolve();
        });
        App.hydrate.route("#cheatsheet", (req, res) => {
            res.resolve();
        });
        App.hydrate.route("#deck", (req, res) => {
            this.handleDeckQuery(req);
            res.resolve();
        });
        App.hydrate.route("", (req, res) => {
            //Page not found
            this.handleSearchQuery(req);
            res.hydrate.navigate("#search");
            res.resolve();
        });

        App.hydrate.navigate();
    }

    static initializeUi():void {
        this.resetSearchParameters();
        this.resetDeckParameters();
    }

    static async loadDatabase():Promise<EvaluatedDigimonTradingCard[]> {
        try
        {
            let cards = await DigimonTCGAPI.getAllCards();
            let evaluationResult = DigimonTradingCardEvaluator.evaluateDatabase(cards);
            this.cardDatabase = {
                cards: evaluationResult.evaluatedCards,
                cardEnums: evaluationResult.cardEnums,
                cardStats: evaluationResult.cardStats
            };
            evaluationResult.evaluatedCards.forEach(card => {
                App.#cards.set(card.number, card);
            });
            return evaluationResult.evaluatedCards;
        }
        catch(error)
        {
            logError(error);
            return null;
        }
    }

    static get cards():Map<string, EvaluatedDigimonTradingCard> {
        return this.#cards;
    }

    static get cardDatabase():AppCardDatabase {
        return this.#hydrate.model(HydrateModelKeys.cardDatabase);
    }
    static set cardDatabase(cardDatabase:AppCardDatabase) {
        this.#hydrate.bind(HydrateModelKeys.cardDatabase, cardDatabase);
    }

    static get search():AppSearch {
        return this.#hydrate.model(HydrateModelKeys.search);
    }
    static set search(search:AppSearch) {
        this.#hydrate.bind(HydrateModelKeys.search, search);
    }

    static get deck():AppDeck {
        return this.#hydrate.model(HydrateModelKeys.deck);
    }
    static set deck(deck:AppDeck) {
        this.#hydrate.bind(HydrateModelKeys.deck, deck);
    }

    static resetSearchParameters():void {
        this.search = new AppSearch();
    }

    static handleSearchQuery(request:HydrateRouteRequest):void {
        if(request.search !== "")
        {
            let query = request.search.substring(1);
            if(App.search.query !== query)
            {
                let searchParameters = App.parseSearchQueryString(query);
                App.search.parameters.list = searchParameters;
                App.updateSearch(searchParameters);
            }                
        }
    }

    static updateSearch(searchParameters:SearchParameter[]):AppCardDatabaseQueryResult {
        let queryResult = this.queryCardDatabase(searchParameters);
        App.search.query = queryResult.query;
        App.search.results = queryResult.results;
        return queryResult;
    }

    static queryCardDatabase(searchParameters:SearchParameter[]):AppCardDatabaseQueryResult {
        searchParameters = searchParameters.filter(x => x.value !== "");
        let query = this.#writeSearchQueryString(searchParameters);
        let filterExpression = this.#generateCardFilterExpression(searchParameters);
        let filter = new Function("card", `return ${filterExpression};`);
        let results = [...this.#cards.values()].filter(card => filter(card));
        return {
            query: query,
            filter: filter,
            results: results
        };
    }
    
    static #writeSearchQueryString(searchParameters:SearchParameter[]):string
    {
        let params:string[] = [];
        searchParameters.forEach(parameter => {
            if(parameter.value == "")
                return;
            params.push(`${parameter.parameterType}=${parameter.condition}:${parameter.value}`);
            //let key = parameter.parameterType;
            // let values = params.get(key);
            // if(values == null)
            // {
            //     values = <string[]>[];
            //     params.set(key, values);
            // }
            // values.push(`${parameter.condition}:${parameter.value}`);
        });
        return params.join("&");
    }

    static parseSearchQueryString(queryString:string):SearchParameter[] {
        let searchParameters:SearchParameter[] = [];
        if(queryString.startsWith("?"))
            queryString = queryString.substring(1);
        decodeURI(queryString).split("&").forEach(token => {
            let [, parameterName, parameterValue] = token.match(/([^=]+)=(.*)/);
            let refParameter = AppSearch.searchableParameters.get(<SearchParameterType>parameterName);
            if(refParameter == null)
                return;
            let parameter = AppSearchParameters.copy(refParameter);
            let [, condition, value] = parameterValue.match(/([^:]+):(.*)/);
            parameter.condition = <SearchParameterConditionType> condition;
            parameter.value = value;
            searchParameters.push(parameter);
        });
        return searchParameters;
    }

    static #generateCardFilterExpression(searchParameters:SearchParameter[]):string {
        return searchParameters
            .map(parameter => this.#writeSearchParameterExpression(parameter))
            .join("&&");
    }

    static #writeSearchParameterExpression(parameter:SearchParameter):string
    {
        let value = parameter.value;

        if(parameter.findFieldFunction == null)
        {
            let fieldName = `card.${Util.nameOfField(parameter.fieldFunction)}`;
            switch(parameter.condition)
            {
                case "equal":
                    return `${fieldName} == "${value}"`;
                case "notEqual":
                    return `${fieldName} != "${value}"`;
                case "greaterThan":
                    return `${fieldName} > "${value}"`;
                case "greaterThanOrEqual":
                    return `${fieldName} >= "${value}"`;
                case "lessThan":
                    return `${fieldName} < "${value}"`;
                case "lessThanOrEqual":
                    return `${fieldName} <= "${value}"`;
                case "match":
                    return `${fieldName}.match(/${value}/i)`;
                case "notMatch":
                    return `!${fieldName}.match(/${value}/i)`;
            }
        }
        
        let fieldName = `card.${Util.nameOfField(parameter.fieldFunction)}.find(x => x.${Util.nameOfField(parameter.findFieldFunction)} == "${value}")`;
        switch(parameter.condition)
        {
            case "equal":
                return `${fieldName}`;
            case "notEqual":
                return `!${fieldName}`;
            default:
                return "";
        }
    }

    static resetDeckParameters():void {
        this.deck = new AppDeck();
    }

    static handleDeckQuery(request:HydrateRouteRequest):void {
        if(request.search !== "")
        {
            let query = request.search.substring(1);
            if(App.search.query !== query)
            {
                let deckParameters = App.parseDeckQueryString(query);
                App.updateDeck("New Deck", deckParameters, this.cards);
            }                
        }
    }

    static updateDeck(name:string, parameters:DeckParameter[], cards:Map<string, EvaluatedDigimonTradingCard>) {
        let deck = this.loadDeck(parameters, cards);
        let deckParameters = this.generateDeckParameters(deck);
        let query = this.writeDeckQueryString(deckParameters);
        App.deck.parameters = deckParameters;
        App.deck.name = name;
        App.deck.list = deck;
        return {
                deck,
                query,
                parameters: deckParameters
            };
    }

    static generateDeckParameters(deck:DigimonTradingCardDeck):DeckParameter[] {
        return [
            this.generateDeckPartParameter(deck.eggDeck),
            this.generateDeckPartParameter(deck.mainDeck),
            this.generateDeckPartParameter(deck.sideDeck)
        ];
    }

    static generateDeckPartParameter(deckPart:DigimonTradingCardDeckPart):DeckParameter {
        let cards = deckPart.activeCategories.flatMap(category => 
            category.deckSpots.map(spot => `${spot.copies} ${spot.card.number}`)
        );
        return new DeckParameter(deckPart.deckType, cards.join("\n"));
    }

    static loadDeck(parameters:DeckParameter[], cards:Map<string, EvaluatedDigimonTradingCard>):DigimonTradingCardDeck {
        let deck = new DigimonTradingCardDeck();
        parameters.forEach(parameter => {
            parameter.text.split("\n").forEach(spot => {
                let [count, cardNumber] = spot.trim().split(/\s+/);
                let copies = Number.parseInt(count);
                if(copies === NaN || cardNumber == null)
                    return;
                let card = cards.get(cardNumber);
                if(card == null)
                {
                    card = new EvaluatedDigimonTradingCard();
                    card.number = cardNumber;
                }
                switch(parameter.deckPartType)
                {
                    case "egg":
                        deck.eggDeck.add(card, copies);
                        break;
                    case "main":
                        deck.mainDeck.add(card, copies);
                        break;
                    case "side":
                        deck.sideDeck.add(card, copies);
                        break;
                }
            })
        });
        return deck;
    }
    
    static writeDeckQueryString(deckParameters:DeckParameter[]):string {
        return deckParameters.map(parameter => {
            let cards:string[] = [];
            parameter.text.split("\n").forEach(line => {
                let [count, cardNumber] = line.trim().split(/\s+/);
                let copies = Number.parseInt(count);
                if(copies === NaN || cardNumber == null)
                    return;
                cards.push(`${cardNumber}:${copies}`);
            });
            return `${parameter.deckPartType}=${cards.join(",")}`;
        })
        .join("&");
    }

    static parseDeckQueryString(queryString:string):DeckParameter[] {
        let deckParameters:DeckParameter[] = [];
        if(queryString.startsWith("?"))
            queryString = queryString.substring(1);
        decodeURI(queryString).split("&").forEach(token => {
            let [, deckPartType, parameterValue] = token.match(/([^=]+)=(.*)/);
            let cards = parameterValue.split(",").map(card => {
                let [cardNumber, count] = card.trim().split(":");
                let copies = Number.parseInt(count);
                if(copies === NaN)
                    copies = 1;
                if(cardNumber == null)
                    cardNumber = "Unknown";
                return `${copies} ${cardNumber}`;
            });
            let deckParameter = new DeckParameter(<DigimonTradingCardDeckPartType>deckPartType, cards.join("\n"));
            deckParameters.push(deckParameter);
        });
        return deckParameters;
    }
}