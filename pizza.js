document.addEventListener("alpine:init", () => {
    Alpine.data('pizzaCart', () => ({
        title: 'Pizza Cart API',
        pizzas: [],
        filteredPizzas: [],
        selectedFilter: {
            small: { type: '', flavour: '' },
            medium: { type: '', flavour: '' },
            large: { type: '', flavour: '' }
        },
        username: 'MofokengTT21',
        cartId: 'euYIRq2Kn8',
        cartPizzas: [],
        totalQty: [],
        sumQty: 0.00,
        pizzaQty: {},
        showQty() {
            const cartQty = this.pizza.qty;
            this.totalQty = cartQty;
            this.sumQty = this.totalQty.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        },

        cartTotal: 0.00,

        
        getCart() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            return axios.get(getCartURL);
        },

        addPizza(pizzaId) {

        return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
            "cart_code" : this.cartId,
            "pizza_id" : pizzaId
        })
        },

        removePizza(pizzaId) {

            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                "cart_code" : this.cartId,
                "pizza_id" : pizzaId
            })
        },

        showCartData() {
            this.getCart().then(result => {
                const cartData = result.data;
                this.cartPizzas = result.data.pizzas;
                this.cartTotal = cartData.total.toFixed(2);
            });
        },

        init() {
            axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                .then(result => {
                    this.pizzas = result.data.pizzas;
                    this.filteredPizzas = this.pizzas;
                });

            this.showCartData();
        },

        addPizzaToCart(pizzaId) {
            this
            .addPizza(pizzaId)
            .then(() => {
                this.showCartData();
            })
        },
        removePizzaFromCart(pizzaId) {
            this
            .removePizza(pizzaId)
            .then(() => {
                this.showCartData();
            })
        },

        incrementQty(pizzaId) {
            if (!this.pizzaQty[pizzaId]) {
                this.pizzaQty[pizzaId] = 2;
            } else {
                this.pizzaQty[pizzaId]++;
            }
        },        

        decrementQty(pizzaId) {
            if (this.pizzaQty[pizzaId] > 1) {
                this.pizzaQty[pizzaId]--;
            }
        },

        updatePizzaQty() {
            this.cartPizzas.forEach(pizza => {
                this.pizzaQty[pizza.id] = pizza.qty;
            });
        },

        orderPizzas(pizzaId) {
            const qty = this.pizzaQty[pizzaId] || 1;
            for (let i = 0; i < qty; i++) {
                this.addPizzaToCart(pizzaId);
            }
        },

        filterPizzas(size = this.selectedFilter.size, criteria, value) {
            if (this.selectedFilter.size !== size) {
                this.selectedFilter[this.selectedFilter.size] = { type: '', flavour: '' };
                this.selectedFilter.size = size;
            }

            if (this.selectedFilter[size][criteria] === value) {
                this.selectedFilter[size][criteria] = '';
            } else {
                this.selectedFilter[size][criteria] = value;
            }

            this.filteredPizzas = this.pizzas.filter(pizza =>
                (!this.selectedFilter[size].type || pizza.size === size && pizza.type === this.selectedFilter[size].type) &&
                (!this.selectedFilter[size].flavour || pizza.size === size && pizza.flavour === this.selectedFilter[size].flavour)
            );
        },

        isSelected(size, criteria, value) {
            return this.selectedFilter[size][criteria] === value;
        },

        resetFilter() {
            this.selectedFilter = {
                small: { type: '', flavour: '' },
                medium: { type: '', flavour: '' },
                large: { type: '', flavour: '' }
            };
            this.filteredPizzas = this.pizzas;
        },

        filterOptions: {
            type: ['meaty', 'chicken', 'veggie'],
            flavour: ['Margherita', 'Garlic & Mushroom', 'Chicken & Mushroom', 'Regina', 'Sweet Chilli Chicken', '3 Cheese', 'Four Season', 'Hawaiian', 'Tikka Chicken']
        },
        pizzaImg(pizza) {
            return `images/pizza-${pizza.flavour.replace(/ /g, '-').toLowerCase()}.jpeg`;
        },
        typeImg(type) {
            return `images/${type}.png`;
        },
        totalQty() {
            return this.cartPizzas.reduce((sum, pizza) => sum + pizza.qty, 0);
        },

        
    }));
});
