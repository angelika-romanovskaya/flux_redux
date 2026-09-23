import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { storeApp } from "./storeApp";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={storeApp}>
		<App />
	</Provider>,
);
