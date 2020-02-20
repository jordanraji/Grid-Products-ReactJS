class Item extends React.Component {
    constructor(props) {
        super(props);

        this.priceHandler = this.priceHandler.bind(this);
    }
    render() {
        return (
            <div className="col-md-3 col-6 my-3">
                {   
                    // IF PRODUCT
                    !this.props.product.ad ?
                    <div className="card card-body h-100">
                        <p className="text-center my-4" style={{ fontSize: this.props.product.size }}>{this.props.product.face}</p>
                        <div className="mt-auto">
                            <h5 className="text-center text-red">${this.priceHandler(this.props.product.price)}</h5>
                            <p className="text-center text-secondary"><small>{this.dateHandler(this.props.product.date)}</small></p>
                        </div>
                    </div>
                    : 
                    // IF AD
                    <div className="card card-body h-100">
                        <img class="ad" src={"/ads/?r="+ Math.floor(Math.random() * 1000)} />
                    </div>
                }
            </div>
        );
    }

    // Function to convert cents to dollars
    priceHandler(cents) {
        return (cents/100.0).toFixed(2);
    }

    // This function calculates the difference between the current date and the date when product was created
    dateHandler(date) {
        const product_date = new Date(date);
        const current_date = new Date();
        const difference_time = Math.abs(current_date - product_date);
        const difference_days = Math.ceil(difference_time / (1000 * 60 * 60 * 24)); 
        if (difference_days < 7){
            return difference_days +" days ago"
        }
        return date.substr(0, 15);
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            products: [], // List of products and ads
            orderBy: "id", // How to order
            page: 0, // Page for calling API
            prevY: 0, // Needed for scrolling
            loading: false, // Needed for API Request
            productsCompleted: false, // true if there are no other products
        };

        this.getProducts = this.getProducts.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    // This function gets the requested products 
    getProducts(page=0, limit=19, sort='id', addToProducts=false) {
        this.setState({loading: true});
        axios({
            url: 'http://localhost:3000/products',
            method: 'get',
            params: {
                "_page": page,
                "_limit": limit,
                "_sort": sort
            }
        }).then(response => {
            const data = response.data

            // If there are no more products update productsCompleted
            if(data.length == 0){
                this.setState({
                    productsCompleted: true
                });
                this.setState({ loading: false });
                return;
            }

            // Adding ad in a random position to products List
            let random_position = Math.floor(Math.random() * 18);
            data.splice(random_position, 0, {ad:true})

            if(addToProducts){
                this.setState({
                    products: this.state.products.concat(data),
                });
            } else {
                this.setState({
                    products: data,
                });
            }
            this.setState({ loading: false });
        }).catch(error =>{
            // Server error prevention
            this.setState({ loading: false });
            alert("Cannot connect to the server. Try again");
        })
    }

    // This function handles the change of the order of the products
    handleChange(){
        this.setState({ 
            orderBy: event.target.value,
            page: 0,
            productsCompleted: false,
        });
        this.getProducts(0, undefined, event.target.value, false);
    }

    // This function handles the scrolling
    handleObserver(entities, observer) {
        const y = entities[0].boundingClientRect.y;
        if (this.state.prevY > y && !this.state.productsCompleted) {
            this.setState({ page: this.state.page + 1 });
            this.getProducts(this.state.page + 1, undefined, this.state.orderBy , true);
        }
        this.setState({ prevY: y });
    }

    componentDidMount() {
        // Get first products
        this.getProducts();

        // Define variables for scrolling
        var options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0
        };

        this.observer = new IntersectionObserver(
            this.handleObserver.bind(this),
            options
        );

        this.observer.observe(this.loadingRef);
    }

    render() {
        const loadingCSS = {
            height: "20px",
            margin: "20px"
        };
        return (
            <div>
                <nav className="navbar fixed-top bg-black">
                    <div className="container">
                        <span className="navbar-brand">faceStore</span>
                        <form className="form-inline">
                            <label>
                                <span className="mr-2">Order by:</span> 
                                <select className="custom-select" onChange={this.handleChange}>
                                    <option value="id">ID</option>
                                    <option value="price">Price</option>
                                    <option value="size">Size</option>
                                </select>
                            </label>
                        </form>
                    </div>
                </nav>
                <div className="container">
                    <div className="row" style={{ minHeight: "80px" }}>
                        {   /* Listing all products */
                            this.state.products.map(function (product, index) {
                                return <Item key={index} product={product}></Item>
                            })
                        }
                    </div>

                    {/* Loading spinner */
                        this.state.loading? 
                            <div className="text-center">
                                <div className="spinner-border">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        : ""
                    }

                    { /* End of Catalogue */
                        this.state.productsCompleted ?
                            <div className="text-center">
                                <h6 className="text-red">~ end of catalogue ~</h6>
                            </div>
                        : ""
                    }

                    <div ref={loadingRef => (this.loadingRef = loadingRef)} style={loadingCSS}>
                    </div>

                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />, document.getElementById('app')
);
