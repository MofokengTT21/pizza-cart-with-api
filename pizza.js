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
        sumQty: 0.00,
        pizzaQty: {},

        showQty() {
            this.sumQty = this.cartPizzas.reduce((accumulator, pizza) => accumulator + pizza.qty, 0);
        },

        cartTotal: 0.00,

        getCart() {
            const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
            return axios.get(getCartURL);
        },

        addPizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
                "cart_code": this.cartId,
                "pizza_id": pizzaId
            }).then(() => {
                this.showCartData();
            });
        },

        removePizza(pizzaId) {
            return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove', {
                "cart_code": this.cartId,
                "pizza_id": pizzaId
            }).then(() => {
                this.showCartData();
            });
        },

        showCartData() {
            this.getCart().then(result => {
                const cartData = result.data;
                this.cartPizzas = cartData.pizzas.reduce((acc, pizza) => {
                    const existingPizza = acc.find(p => p.id === pizza.id);
                    if (existingPizza) {
                        existingPizza.qty += pizza.qty;
                    } else {
                        acc.push(pizza);
                    }
                    return acc;
                }, []);
                this.cartTotal = cartData.total.toFixed(2);
                this.showQty(); // Update quantity after getting cart data
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
            this.addPizza(pizzaId);
        },

        removePizzaFromCart(pizzaId) {
            this.removePizza(pizzaId);
        },

        incrementQty(pizzaId) {
            this.pizzaQty[pizzaId] = (this.pizzaQty[pizzaId] ?? 1) + 1;
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
            let i = 0;
        
            const addNextPizza = () => {
                if (i < qty) {
                    this.addPizza(pizzaId).then(() => {
                        i++;
                    });
                    setTimeout(addNextPizza, 300);
                }
            };
            addNextPizza();
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
