# Redux в проекте

## Схема файлов

```
src/
├── redux/
│   ├── actions.js       // action creators — функции, создающие actions
│   ├── reducer.js       // редьюсер — чистая функция (state, action) => newState
│   └── store.js         // создание стора через legacy_createStore
├── components/
│   ├── TodoList.jsx     // читает todos, диспатчит toggle/remove
│   └── TodoForm.jsx      // диспатчит addTodo
├── App.jsx              // собирает всё вместе
└── index.jsx            // оборачивает <App /> в <Provider store={store}>
```

Поток данных:

```
компонент → dispatch(action) → reducer → новый state → useSelector → компонент
```

## Пример action

Action — обычный объект с обязательным полем `type` и (обычно) `payload`. Action creator — функция, которая его возвращает.

**`redux/actionTypes.js`**
```js
export const ActionTypes = {
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  REMOVE_TODO: "REMOVE_TODO",
  RESET: "RESET",
};
```

**`redux/actions.js`**
```js
import { ActionTypes } from "./actionTypes";

export const addTodo = (text) => ({
  type: ActionTypes.ADD_TODO,
  payload: { text },
});

export const toggleTodo = (id) => ({
  type: ActionTypes.TOGGLE_TODO,
  payload: { id },
});

export const removeTodo = (id) => ({
  type: ActionTypes.REMOVE_TODO,
  payload: { id },
});

export const reset = () => ({
  type: ActionTypes.RESET,
});
```

Сам action по стандарту выглядит так:

```js
{ type: "ADD_TODO", payload: { text: "Изучить Redux" } }
```

## Пример reducer

Редьюсер — **чистая функция**, которая берёт текущий стейт и action и возвращает новый стейт. Не мутирует данные, не делает запросов, не пишет в `localStorage`.

**`redux/reducer.js`**
```js
import { v4 } from "uuid";
import { ActionTypes } from "./actionTypes";

const initialState = {
  todos: [
    { id: 1, text: "Изучить Flux", done: false },
    { id: 2, text: "Сделать ДЗ 22", done: false },
  ],
};

export const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_TODO: {
      const text = action.payload.text.trim();
      if (!text) return state; // ← никогда не возвращаем null!
      return {
        ...state,
        todos: [...state.todos, { id: v4(), text, done: false }],
      };
    }

    case ActionTypes.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? { ...t, done: !t.done } : t,
        ),
      };

    case ActionTypes.REMOVE_TODO:
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.id),
      };

    case ActionTypes.RESET:
      return { ...state, todos: [] };

    default:
      return state;
  }
};
```

**Правила редьюсера:**
- Всегда возвращать **объект стейта**, а не `null` / `undefined`.
- Не мутировать `state`, а копировать через `...state` и создавать новые массивы/объекты.
- Если action незнакомый — вернуть `state` без изменений (ветка `default`).

**`redux/store.js`**
```js
import { legacy_createStore } from "redux";
import { todoReducer } from "./reducer";

export const store = legacy_createStore(todoReducer);
```

`legacy_createStore` — то же самое, что `createStore`, но без предупреждения об устаревании. Это «старый» API Redux. В продакшене обычно берут `configureStore` из `@reduxjs/toolkit`.

## Provider, useSelector, useDispatch

### `<Provider store={store}>`

Компонент-обёртка, который «пробрасывает» Redux-стор внутрь дерева React через контекст. Без него `useSelector` и `useDispatch` не найдут стор и упадут.

**`index.jsx`**
```jsx
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

Правило: `Provider` ставится **один раз**, как можно выше в дереве — обычно прямо в точке входа.

### `useSelector`

Хук, который **читает** данные из стора. Принимает селектор — функцию `state => нужный кусок`. Когда этот кусок меняется, компонент перерисовывается.

```jsx
import { useSelector } from "react-redux";

const { todos } = useSelector((store) => store);
// или только одно поле:
const todos = useSelector((store) => store.todos);
```

**Важно:** селектор должен возвращать **стабильное значение**. Если он каждый раз создаёт новый объект — компонент будет перерисовываться на каждое изменение стора. Поэтому либо возвращай примитив, либо готовый кусок стейта.

### `useDispatch`

Хук, который даёт доступ к функции `dispatch`. Через неё компонент отправляет actions в стор — редьюсер их обработает и обновит состояние.

```jsx
import { useDispatch } from "react-redux";
import { toggleTodo } from "../redux/actions";

const dispatch = useDispatch();

<button onClick={() => dispatch(toggleTodo(todo.id))}>…</button>
```

`dispatch(addTodo("Новая задача"))` создаёт action `{ type: "ADD_TODO", payload: { text: "Новая задача" } }`, редьюсер его ловит и добавляет в `state.todos`.

## Мини-пример целиком

```jsx
import { useDispatch, useSelector } from "react-redux";
import { addTodo, toggleTodo } from "./redux/actions";

export default function App() {
  const { todos } = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <div>
      <button onClick={() => dispatch(addTodo("Новая задача"))}>
        Добавить
      </button>

      <ul>
        {todos.map((t) => (
          <li
            key={t.id}
            onClick={() => dispatch(toggleTodo(t.id))}
            style={{ textDecoration: t.done ? "line-through" : "none" }}
          >
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```