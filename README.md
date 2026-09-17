# Redux + redux-thunk + loggerMiddleware

Учебный проект на React + Redux. Внутри два независимых приложения на одном сторе, переключаются табами:

- **Задачи** (todo)
- **Posts** — асинхронная загрузка с публичного API (jsonplaceholder).

## Запуск

```bash
npm install
npm start
```

## Стек

- `react` + `react-dom`
- `redux` (legacy API: `legacy_createStore`, `combineReducers`, `applyMiddleware`)
- `react-redux` (`Provider`, `useSelector`, `useDispatch`)
- `redux-thunk` — для async actions
- `uuid` — генерация id задач

## Структура проекта

```
src/
├── redux/
│   ├── todo/
│   │   ├── actions.js
│   │   └── reducer.js
│   ├── posts/
│   │   ├── actions.js
│   │   └── reducer.js
│   ├── middlewares/
│   │   └── loggerMiddleware.js
│   └── store.js           // combineReducers + applyMiddleware(thunk, logger)
├── components/
│   ├── TodoApp.jsx        // приложение «Задачи»
│   ├── PostsApp.jsx       // приложение «Posts»
│   ├── TodoForm.jsx
│   ├── TodoList.jsx
│   ├── TodoStats.jsx
│   └── ...
├── App.jsx                // табы + рендер активного приложения
├── index.jsx              // <Provider store={store}><App /></Provider>
└── App.css
```

## Схема стора

Стор собран из двух независимых срезов через `combineReducers`:

```js
{
  todo:  { todos: [...] },                    // синхронный срез
  posts: { posts: [], loading, error }        // асинхронный срез
}
```

Оба приложения живут одновременно, переключаются табами. Данные не теряются при переходе между вкладками, потому что оба среза всегда в сторе.

## Store

**`redux/store.js`**
```js
import { applyMiddleware, combineReducers, legacy_createStore } from "redux";
import { thunk } from "redux-thunk";
import { todoReducer } from "./todo/reducer";
import { postsReducer } from "./posts/reducer";
import { loggerMiddleware } from "./middlewares/loggerMiddleware";

const rootReducer = combineReducers({
  todo: todoReducer,
  posts: postsReducer,
});

export const store = legacy_createStore(
  rootReducer,
  applyMiddleware(thunk, loggerMiddleware),
);
```

Порядок `applyMiddleware(thunk, loggerMiddleware)` важен:
- `thunk` идёт **первым** — он должен перехватить функции до того, как логгер попытается прочитать `action.type`. У функции нет `.type`, и логгер вывел бы `undefined`.
- `applyMiddleware(...)` передаётся **вторым аргументом** `legacy_createStore` (первый — редьюсер). Частая ошибка — положить его вторым аргументом в `combineReducers`, и тогда `dispatch` остаётся «сырым», thunk не работает, а `dispatch(fetchPosts())` падает с `Actions must be plain objects`.

## Async action (redux-thunk)

Обычный Redux умеет диспатчить только объекты. `redux-thunk` расширяет `dispatch`: если передать **функцию**, thunk-middleware её вызовет, передав `dispatch` и `getState`.

**`redux/posts/actions.js`**
```js
export const fetchPosts = () => async (dispatch) => {
  dispatch(fetchPostsRequest());
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dispatch(fetchPostsSuccess(data));
  } catch (e) {
    dispatch(fetchPostsFailure(e.message));
  }
};
```

В компоненте:
```js
const dispatch = useDispatch();
dispatch(fetchPosts());
```

Три состояния запроса (`REQUEST` / `SUCCESS` / `FAILURE`) реализованы через разные `action.type`, а reducer переключает `loading` и `error`:

```js
{ posts: [], loading: true,  error: null }   // REQUEST
{ posts: [...], loading: false, error: null } // SUCCESS
{ posts: [], loading: false, error: "..." }   // FAILURE
```

## Свой middleware — loggerMiddleware

**`redux/middlewares/loggerMiddleware.js`**
```js
export const loggerMiddleware = (store) => (next) => (action) => {
  console.group(`action: ${action.type}`);
  console.log("prev state", store.getState());

  const result = next(action);

  console.log("next state", store.getState());
  console.groupEnd();

  return result;
};
```

Что важно:
- `next(action)` вызывается **до** второго `getState()` — только так увидим обновлённый стейт.
- Результат `next(action)` нужно **вернуть** — иначе сломается цепочка middleware.
- В консоли для каждого действия видно: `type` → состояние до → состояние после.

## Provider, useSelector, useDispatch

- **`<Provider store={store}>`** — оборачивает `<App />` в `index.jsx`, один раз, в точке входа. Через React-контекст даёт доступ к стору.
- **`useSelector(selector)`** — читает данные из стора. Возвращает только тот кусок, который вернул селектор. Компонент перерисовывается при изменении этого куска.
- **`useDispatch()`** — возвращает функцию `dispatch`. Через неё компоненты отправляют actions в стор.

Пример:
```jsx
const { todos } = useSelector((state) => state.todo);
const { posts, loading, error } = useSelector((state) => state.posts);
const dispatch = useDispatch();

<button onClick={() => dispatch(fetchPosts())}>Загрузить данные</button>
```

## Табы

Оба приложения рендерятся в `App.jsx`, но по очереди:

```jsx
const [tab, setTab] = useState("todos");

<div className="tabs">
  <button className={tab === "todos" ? "tab active" : "tab"} onClick={() => setTab("todos")}>Задачи</button>
  <button className={tab === "posts" ? "tab active" : "tab"} onClick={() => setTab("posts")}>Posts</button>
</div>

{tab === "todos" && <TodoApp />}
{tab === "posts" && <PostsApp />}
```

Активный таб хранится в локальном `useState`, потому что это UI-состояние, а не данные приложения.

## Зачем нужен middleware

Middleware — это слой между `dispatch` и редьюсером. Каждый action проходит через цепочку middleware, и каждый из них может:

- посмотреть на action,
- изменить или отменить его,
- выполнить сайд-эффект (логирование, запрос, аналитика),
- передать дальше через `next(action)`.

Так в Redux появляется место для побочных эффектов, которых не должно быть в редьюсере.

## Почему side effects не пишут прямо в reducer

Редьюсер обязан быть **чистой функцией**:

- одинаковый вход → одинаковый выход,
- никаких мутаций входного `state`,
- никаких побочных эффектов (`fetch`, `setTimeout`, логгирование, `localStorage`).

Причины:

1. **Предсказуемость.** Redux вызывает редьюсер много раз, включая внутренние проверки, повторные рендеры и time-travel в DevTools. Если внутри `fetch`, запросы полетят десятками.
2. **Тестируемость.** Чистую функцию легко протестировать: дал стейт и action — проверил результат. С сетью пришлось бы мокать `fetch`.
3. **DevTools.** Redux DevTools «отматывает» историю, применяя actions заново. Сайд-эффекты при этом сломают приложение.
4. **Разделение ответственности.** Редьюсер — про то, «как меняется стейт». Сайд-эффекты — задача middleware / thunk / saga.

Именно поэтому запрос живёт в thunk, а в reducer попадают только готовые `SUCCESS` / `FAILURE` с данными или ошибкой в `payload`.