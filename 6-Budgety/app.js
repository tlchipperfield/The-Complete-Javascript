
// BUDGET CONTROLLER Module
var budgetController = (function() {
    // Expense function constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // Income function constructor
    var Income = function(id, description, value) {
        this.id =id;
        this.description = description;
        this.value = value;
    };

    var caculateTotal = function(type) {
        var sum = 0;
        // loop over array to get sum (hint: use forEach)
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        // Store sums in data.totals
        data.totals[type] = sum;
    }


    // Main data Object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    // Budget Controller Module Methods
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //store the data
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3

            var ids =data.allItems[type].map(function(current) {
                // map returns a brand new array
                return current.id;
            });

            index = ids.indexOf(id);
            // if value isn't -1 then delete
            if (index !== -1) {
                // splice method, remove element
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses
            caculateTotal('exp');
            caculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate theepercentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };

        },
        testing: function() {
            console.log(data);
        }
    };


})();





// UI CONTROLLER Module
var UIController = (function() {

    // DOM strings data
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'

    };

    // UI Controller Module returns
    return {
        getinput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                // parseFloat to convert string to number with decimal
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string with PLaceholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the lpaceholder text with some real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID) {
            // Remove by going up selecting the parent then delete the child of that
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function() {
            var fields,fieldsArray;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // fields.slice() Will not work!
            // slice is stored in array prototype properties
            var fieldsArray = Array.prototype.slice.call(fields);

            // forEach loop used on the array. The function can recieve up to 3 callback objs. (current, index number, array)
            fieldsArray.forEach(function (current, index, array) {
                //EMPTY FIELDS FIRST
                current.value = "";

            });

            fieldsArray[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },


        // Allows public pass DOMstrings
        getDOMstrings: function() {
            return DOMstrings;
        }
    }

})();


//  GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    // Setup all event listeners
    var setupEventListeners = function(){
        // Return DOMstrings as DOM in this constroller
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    };


    //updatre budget Method
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();


        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    
    // Update Percentages
    var updatePercentages = function(){

        // 1) calculate percentages


        // 2) read them from the budget controller


        // 3) update user interface with new percentages



    }

    // Add the item to either Income or Expense objects
    var ctrlAddItem = function(){

        var input, newItem;

        // 1. Get field input data
        var input = UICtrl.getinput();
        // Only do something iIF there is data in the input fields
        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
            // 2. Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 3 b. Clear the fields
            UICtrl.clearFields();
            // 4. Calculate and update Budget
            updateBudget();
            // 5. calculate and update percentages
            updatePercentages();
        }
    }

    
    var ctrlDeleteItem = function (event){
        var itemID, splitID, type, ID;
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // coerced to true or false
        if (itemID) {
            //inc-1 inc-2 so on.....
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();
            
            // 5. calculate and update percentages
            updatePercentages();

        }
    }

    // PUBLIC INIT
    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });}
    }

})(budgetController,UIController);


controller.init();



