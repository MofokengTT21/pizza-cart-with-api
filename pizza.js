document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => ({
    title: "Pizza Cart API",
    pizzas: [],
    filteredPizzas: [],
    selectedFilter: {
      small: { type: "", flavour: "" },
      medium: { type: "", flavour: "" },
      large: { type: "", flavour: "" },
    },
    username: "",
    usernameInput:"",
    cartId: "",
    showPopup: false,
    cartPizzas: [],
    sumQty: 0.0,
    pizzaQty: {},
    resetTimeoutId: null,

    showQty() {
      this.sumQty = this.cartPizzas.reduce(
        (accumulator, pizza) => accumulator + pizza.qty,
        0
      );
    },

    cartTotal: 0.0,
    paymentAmount: '',
    message: '',
    messagePaid: '',
    createCart() {
      const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
      return axios.get(createCartURL)
        .then(result => {
          this.cartId = result.data.cart_code;
        });
    },

    getCart() {
      const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
      return axios.get(getCartURL);
    },

    addPizza(pizzaId) {
      return axios
        .post("https://pizza-api.projectcodex.net/api/pizza-cart/add", {
          cart_code: this.cartId,
          pizza_id: pizzaId,
        })
        .then(() => {
          this.showCartData();
        });
    },

    removePizza(pizzaId) {
      return axios
        .post("https://pizza-api.projectcodex.net/api/pizza-cart/remove", {
          cart_code: this.cartId,
          pizza_id: pizzaId,
        })
        .then(() => {
          this.showCartData();
        });
    },

    pay(amount) {
      return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay',
        {
          "cart_code": this.cartId,
          amount
        })
    },

    showCartData() {
      this.getCart().then((result) => {
        const cartData = result.data;
        this.cartPizzas = cartData.pizzas.reduce((acc, pizza) => {
          const existingPizza = acc.find((p) => p.id === pizza.id);
          if (existingPizza) {
            existingPizza.qty += pizza.qty;
          } else {
            acc.push(pizza);
          }
          return acc;
        }, []);
        this.cartTotal = cartData.total.toFixed(2);
        this.showQty();
      });
    },

    init() {
      axios
        .get("https://pizza-api.projectcodex.net/api/pizzas")
        .then((result) => {
          this.pizzas = result.data.pizzas;
          this.filteredPizzas = this.pizzas;
        });
      if (!this.cartId) {
        this
          .createCart()
          .then((result) => {
            this.showCartData();
          })
      }
    },

    addPizzaToCart(pizzaId) {
      this.addPizza(pizzaId);
    },

    removePizzaFromCart(pizzaId) {
      this.removePizza(pizzaId);
    },

    payForCart() {
      this
        .pay(this.paymentAmount)
        .then(result => {
          if (result.data.status == 'failure') {
            this.message = "Payment unsuccessful";
            setTimeout(() => this.message = '', 3000);
          } else {
            this.messagePaid = "Payment successful";
            setTimeout(() => {
              this.message = '';
              this.cartPizzas = [];
              this.cartTotal = 0.00;
              this.cartId = '',
                this.createCart(),
                this.paymentAmount = '',
                this.messagePaid = ''
            }, 3000);
          }
        })
    },

    incrementQty(pizzaId) {
      this.pizzaQty[pizzaId] = (this.pizzaQty[pizzaId] ?? 0) + 1;
    },

    decrementQty(pizzaId) {
      if (this.pizzaQty[pizzaId] > 0) {
        this.pizzaQty[pizzaId]--;
      }
    },

    updatePizzaQty() {
      this.cartPizzas.forEach((pizza) => {
        this.pizzaQty[pizza.id] = pizza.qty;
      });
    },

    orderPizzas(pizzaId) {
      if (!this.incrementUsed && !this.pizzaQty[pizzaId]) {
        this.incrementQty(pizzaId);
      }
      const qty = this.pizzaQty[pizzaId] || 1;
      if (this.resetTimeoutId) {
        clearTimeout(this.resetTimeoutId);
      }
      for (let i = 0; i < qty; i++) {
        setTimeout(() => {
          this.addPizza(pizzaId);
        }, 300 * i);
      }
      this.resetTimeoutId = setTimeout(() => {
        this.pizzaQty[pizzaId] = 0;
      }, 300 * qty);
    },

    filterPizzas(size = this.selectedFilter.size, criteria, value) {
      if (this.selectedFilter.size !== size) {
        this.selectedFilter[this.selectedFilter.size] = {
          type: "",
          flavour: "",
        };
        this.selectedFilter.size = size;
      }

      if (this.selectedFilter[size][criteria] === value) {
        this.selectedFilter[size][criteria] = "";
      } else {
        this.selectedFilter[size][criteria] = value;
      }

      this.filteredPizzas = this.pizzas.filter(
        (pizza) =>
          (!this.selectedFilter[size].type ||
            (pizza.size === size &&
              pizza.type === this.selectedFilter[size].type)) &&
          (!this.selectedFilter[size].flavour ||
            (pizza.size === size &&
              pizza.flavour === this.selectedFilter[size].flavour))
      );
    },

    isSelected(size, criteria, value) {
      return this.selectedFilter[size][criteria] === value;
    },

    resetFilter() {
      this.selectedFilter = {
        small: { type: "", flavour: "" },
        medium: { type: "", flavour: "" },
        large: { type: "", flavour: "" },
      };
      this.filteredPizzas = this.pizzas;
    },

    filterOptions: {
      type: ["meaty", "chicken", "veggie"],
      flavour: [
        "Margherita",
        "Garlic & Mushroom",
        "Chicken & Mushroom",
        "Regina",
        "Sweet Chilli Chicken",
        "3 Cheese",
        "Four Season",
        "Hawaiian",
        "Tikka Chicken",
      ],
    },

    pizzaImg(pizza) {
      return `images/pizza-${pizza.flavour
        .replace(/ /g, "-")
        .toLowerCase()}.jpeg`;
    },

    typeImg(type) {
      return `images/${type}.png`;
    },

    totalQty() {
      return this.cartPizzas.reduce((sum, pizza) => sum + pizza.qty, 0);
    },
    openPopup() {
      this.showPopup = true;
    },

    closePopup() {
      this.showPopup = false;
    },

    submitUsername() {
      this.username = this.usernameInput;
      this.closePopup();
    },
    stopPropagation(event) {
      event.stopPropagation();
    },
  }));
});
