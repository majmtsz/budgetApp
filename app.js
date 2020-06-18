// DATA CONTROLLER MODULE
var budgetController = (function () {
    // some conde inside module

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    };


    const data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,

    };

    const calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (elem) {
            sum += elem.value;
        })
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // create ID based on current allItems 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            };
            // create new item based on 'inc' or 'exp' type
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            }

            // add new item to data - to exp array or to inc array
            data.allItems[type].push(newItem);

            // return new element
            return newItem;

        },

        deleteItem: function (type, ID) {
            // data.allItems[type][id] -would not work, because we can delete items- index of the table can be lower that ID od expence or income 
            // create new array - with ids of current data
            var currArrIds = data.allItems[type].map(function (item) {
                return item.id;
            });
            // getting factual index of inc/exp, that we want to delete - if it does not occur, indexof returns -1
            var index = currArrIds.indexOf(ID)

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (elem) {
                elem.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        calculateBudget: function () {
            // calculate total incomes and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budteg: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the % of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage

            }
        },

        testing: function () {
            console.log(data);

        }
    }

})();


// UI CONTROLLER MODULE
var UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomesLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: 'body > div.top > div > div.budget__title > span'

    };

    const formatNumber = function (number, type) {
        number = Math.abs(number);
        // convert to String with .00 or other 2 digits at the end
        number = number.toFixed(2);

        // add ',' if there are more than 4 digits before comma
        if (number.length > 6) {
            number = number.substring(0, number.length - 6) + ',' + number.substring(number.length - 6, number.length)
        }

        // add + or - accordingly
        if (type === 'inc') {
            number = `+ ${number}`;
        } else if (type === 'exp') {
            number = `- ${number}`;
        }
        return number
    };

    var nodeListForEach = function (NodeList, callback) {
        for (var i = 0; i < NodeList.length; i++) {
            callback(NodeList[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        displayDate: function () {
            var now, year, month, months
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).innerText = months[month] + ' ' + year;

        },

        addListItem: function (obj, type) {
            var html, newHTML, element
            // create HTML list with placehodler text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>                <div class="right clearfix">                    <div class="item__value">%value%</div>                    <div class="item__percentage">21%</div>                    <div class="item__delete">                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>                    </div>                </div>            </div>'
            }

            // replace the placehodler text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

            // insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function (selectorID) {
            // delete elem with selectorID from UI
            document.getElementById(selectorID).remove();
        },

        clearFields: function () {
            // clearing filds where user inserts descripion and value
            var fields
            fields = [...document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)];
            fields.forEach(elem => elem.value = '');
            // setting focus to description
            fields[0].focus();

        },

        displayBudget: function (obj) {

            if (obj.budget <= 0) {
                document.querySelector(DOMstrings.budgetLabel).innerText = formatNumber(obj.budget, 'exp');
            } else {
                document.querySelector(DOMstrings.budgetLabel).innerText = formatNumber(obj.budget, 'inc');
            }


            document.querySelector(DOMstrings.incomesLabel).innerText = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).innerText = formatNumber(obj.totalExp, 'exp');


            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).innerText = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).innerText = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (elem, index) {
                if (percentages[index] >= 0) {
                    elem.textContent = percentages[index] + '%';
                } else {
                    elem.textContent = '---'
                }
            })

            // MORE UPTODATE SOLUTION:
            // const fields = [...document.querySelectorAll(DOMstrings.expensesPercentageLabel)];
            // fields.forEach(function (elem, index) {
            //     if (percentages[index] > 0) {
            //         elem.textContent = percentages[index] + '%';
            //     } else {
            //         elem.textContent = '---'
            //     }
            // })
        },
        changeType: function () {
            var fiels = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fiels, function (cur) {
                cur.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: function () {
            return DOMstrings;
        }

    };
})();


// GLOBAL APP CONTROLLER
var contoller = (function (budgetCTRL, UICTRL) {

    const setupEventListeners = function () {
        // getting DOM selectors
        const DOM = UICTRL.getDOMstrings();

        // listening to click on button to add item to budget
        const btn = document.querySelector(DOM.inputBtn);
        btn.addEventListener('click', ctrlAddItem);

        // listening to press enter/return key on the keyboard to add item to budget
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            } else return
        })

        // delete item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // change colors of inputs - expenses or incomes
        document.querySelector(DOM.inputType).addEventListener('change', UICTRL.changeType)

    }

    const updateBudget = function () {
        // 1. Calculate the budget
        budgetCTRL.calculateBudget();

        // 2. Return the budget
        const budget = budgetCTRL.getBudget();

        // 3. Display the dudget on the UI
        UICTRL.displayBudget(budget);

    };

    const updatePerecentages = function () {

        // Calculate percentages
        budgetCTRL.calculatePercentages();

        // read percentages from the budget controller
        var percentages = budgetCTRL.getPercentages();

        // update the UI with new percentages
        UICTRL.displayPercentages(percentages);
    }


    const ctrlAddItem = function () {
        var input, newItem
        // 1. get the field input data
        input = UICTRL.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget budgetController
            newItem = budgetCTRL.addItem(input.type, input.description, input.value);

            // 3. add the item to the UIController
            UICTRL.addListItem(newItem, input.type);

            // 4. clear fields
            UICTRL.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and update percentages
            updatePerecentages();

        }
    }

    const ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID
        // hard-coded DOM structure, but this is not a big deal, because elements added to DOM are also hard-coded, so it is OK
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from the data structure
            budgetCTRL.deleteItem(type, ID);

            // delete from UI
            UICTRL.deleteListItem(itemID);

            //update and sshow the new budget
            updateBudget();

            // calculate and update percentages
            updatePerecentages();
        }

    };


    return {
        init: function () {
            console.log('The app has started');
            UICTRL.displayBudget(budgetCTRL.getBudget());
            setupEventListeners();
            UICTRL.displayDate();
        }
    }


})(budgetController, UIController);


contoller.init();