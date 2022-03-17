class KeyValuePair {
    key;
    value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
class HydrateModelKeys {
    static cardDatabase = "cardDatabase";
    static search = "search";
}
class AppCardDatabase {
    cards;
    cardEnums;
    cardStats;
}
class AppCardDatabaseQueryResult {
    query;
    filter;
    results;
}
class AppSearch {
    static searchableParameters = new Map();
    parameters;
    results;
    query = null;
    constructor() {
        let enums = App.hydrate.state(App.cardDatabase.cardEnums);
        const mockCard = new EvaluatedDigimonTradingCard();
        const mockEffect = new DigimonTradingCardEffect();
        const mockAbility = new DigimonTradingCardAbility();
        const mockSet = new DigimonTradingCardSet();
        let avaliableParameters = [];
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
        avaliableParameters.push(new NumberSearchParameter("digiScore", mockCard => mockCard.evaluation.digiScore, null, "Digi-Score", "Any numerical value, e.g. 31"));
        AppSearch.searchableParameters.clear();
        avaliableParameters.forEach(type => AppSearch.searchableParameters.set(type.parameterType, type));
        this.parameters = new AppSearchParameters();
        this.results = [];
    }
}
class AppSearchParameters {
    availableParameters;
    list = [];
    addParameterType = null;
    constructor() {
        this.availableParameters = [...AppSearch.searchableParameters.values()]
            .map(parameter => AppSearchParameters.copy(parameter))
            .sort((x, y) => x.fieldName < y.fieldName ? -1 : 1);
        // this.list = [...AppSearch.searchableParameters.values()]
        //     .map(parameter => AppSearchParameters.copy(parameter));
    }
    static copy(parameter) {
        let result = JSON.parse(JSON.stringify(parameter));
        result.fieldFunction = parameter.fieldFunction;
        result.findFieldFunction = parameter.findFieldFunction;
        return result;
    }
}
class SearchParameter {
    fieldName;
    parameterType;
    templateType;
    fieldFunction;
    findFieldFunction;
    //paramName:string;
    placeholder;
    value;
    availableConditions;
    condition;
    constructor(templateType, parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "", condition = "equal") {
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
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "") {
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
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "") {
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
    options;
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, options, value = "") {
        super("SelectSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, "", value, "equal");
        this.options = options;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual")
        ];
    }
}
function logError(error) {
    console.error(error);
    alert(error.message);
}
class App {
    static #hydrate;
    static #cards;
    static get hydrate() {
        return this.#hydrate;
    }
    static async start() {
        let options = new HydrateAppOptions();
        this.#hydrate = new HydrateApp(options);
        this.#cards = new Map();
        await this.loadDatabase();
        this.initializeUi();
        App.hydrate.route("", (req, res) => {
            if (req.search !== "") {
                let query = req.search.substring(1);
                if (App.search.query !== query) {
                    let searchParameters = App.parseQueryString(query);
                    App.search.parameters.list = searchParameters;
                    App.updateSearch(searchParameters);
                }
            }
            res.continue();
        });
        App.hydrate.route("#search", (req, res) => {
            res.resolve();
        });
        App.hydrate.route("#cards", (req, res) => {
            res.resolve();
        });
        App.hydrate.route("", (req, res) => {
            //Page not found
            res.hydrate.navigate("#search");
            res.resolve();
        });
        App.hydrate.navigate();
    }
    static initializeUi() {
        this.resetSearchParameters();
    }
    static async loadDatabase() {
        try {
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
        catch (error) {
            logError(error);
            return null;
        }
    }
    static get cards() {
        return this.#cards;
    }
    static get cardDatabase() {
        return this.#hydrate.model(HydrateModelKeys.cardDatabase);
    }
    static set cardDatabase(cardDatabase) {
        this.#hydrate.bind(HydrateModelKeys.cardDatabase, cardDatabase);
    }
    static get search() {
        return this.#hydrate.model(HydrateModelKeys.search);
    }
    static set search(search) {
        this.#hydrate.bind(HydrateModelKeys.search, search);
    }
    static resetSearchParameters() {
        this.search = new AppSearch();
    }
    static updateSearch(searchParameters) {
        let queryResult = this.queryCardDatabase(searchParameters);
        App.search.query = queryResult.query;
        App.search.results = queryResult.results;
        return queryResult;
    }
    static queryCardDatabase(searchParameters) {
        searchParameters = searchParameters.filter(x => x.value !== "");
        let query = this.#writeQueryString(searchParameters);
        let filterExpression = this.#generateCardFilterExpression(searchParameters);
        let filter = new Function("card", `return ${filterExpression};`);
        let results = [...this.#cards.values()].filter(card => filter(card));
        return {
            query: query,
            filter: filter,
            results: results
        };
    }
    static #writeQueryString(searchParameters) {
        let params = [];
        searchParameters.forEach(parameter => {
            if (parameter.value == "")
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
    static parseQueryString(queryString) {
        let searchParameters = [];
        if (queryString.startsWith("?"))
            queryString = queryString.substring(1);
        decodeURI(queryString).split("&").forEach(token => {
            let [, parameterName, parameterValue] = token.match(/([^=]+)=(.*)/);
            let refParameter = AppSearch.searchableParameters.get(parameterName);
            if (refParameter == null)
                return;
            let parameter = AppSearchParameters.copy(refParameter);
            let [, condition, value] = parameterValue.match(/([^:]+):(.*)/);
            parameter.condition = condition;
            parameter.value = value;
            searchParameters.push(parameter);
        });
        return searchParameters;
    }
    static #generateCardFilterExpression(searchParameters) {
        return searchParameters
            .map(parameter => this.#writeParameterExpression(parameter))
            .join("&&");
    }
    static #writeParameterExpression(parameter) {
        let value = parameter.value;
        if (parameter.findFieldFunction == null) {
            let fieldName = `card.${Util.nameOfField(parameter.fieldFunction)}`;
            switch (parameter.condition) {
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
        switch (parameter.condition) {
            case "equal":
                return `${fieldName}`;
            case "notEqual":
                return `!${fieldName}`;
            default:
                return "";
        }
    }
}
