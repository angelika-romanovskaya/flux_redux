# CRUD на RTK Query (JavaScript)

## Структура API slice

`createApi` — это фабрика RTK Query. Она создаёт всё, что нужно для работы с HTTP: reducer для кэша, middleware для управления запросами и автогенерируемые хуки для каждого endpoint.

`src/rtk-query/apiSlice.js`:

```js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
	reducerPath: "api", // ключ ветки в store
	baseQuery: fetchBaseQuery({
		baseUrl: "https://jsonplaceholder.typicode.com", // базовый клиент
	}),
	tagTypes: ["Items"], // объявление типов тегов
	endpoints: (builder) => ({
		// READ (список)
		getItems: builder.query({
			query: () => "/posts",
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: "Items", id })),
							{ type: "Items", id: "LIST" },
						]
					: [{ type: "Items", id: "LIST" }],
		}),

		// READ (один)
		getItemById: builder.query({
			query: (id) => `/posts/${id}`,
			providesTags: (result, error, id) => [{ type: "Items", id }],
		}),

		// CREATE
		createItem: builder.mutation({
			query: (newItem) => ({
				url: "/posts",
				method: "POST",
				body: newItem,
			}),
			invalidatesTags: [{ type: "Items", id: "LIST" }],
		}),

		// UPDATE
		updateItem: builder.mutation({
			query: ({ id, ...patch }) => ({
				url: `/posts/${id}`,
				method: "PUT",
				body: patch,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Items", id },
				{ type: "Items", id: "LIST" },
			],
		}),

		// DELETE
		deleteItem: builder.mutation({
			query: (id) => ({
				url: `/posts/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, id) => [
				{ type: "Items", id },
				{ type: "Items", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetItemsQuery,
	useGetItemByIdQuery,
	useCreateItemMutation,
	useUpdateItemMutation,
	useDeleteItemMutation,
} = apiSlice;
```

### Из чего состоит API slice

| Поле                                    | Назначение                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `reducerPath`                           | Имя ветки в Redux store. Используется как ключ: `[apiSlice.reducerPath]: apiSlice.reducer`                        |
| `baseQuery`                             | Базовый HTTP-клиент. Чаще всего `fetchBaseQuery`, но может быть кастомная функция с авторизацией, ретраями и т.п. |
| `tagTypes`                              | Массив типов тегов, которыми будут помечаться данные (для инвалидации кэша)                                       |
| `endpoints`                             | Функция `builder => ({ ... })`. Внутри объявляются все query и mutation                                           |
| `builder.query`                         | Для чтения (GET). Автогенерирует `useXxxQuery`                                                                    |
| `builder.mutation`                      | Для записи (POST / PUT / PATCH / DELETE). Автогенерирует `useXxxMutation`                                         |
| `keepUnusedDataFor`                     | (опц.) Время жизни кэша неиспользуемых данных в секундах, по умолчанию `60`                                       |
| `refetchOnFocus` / `refetchOnReconnect` | (опц.) Автоматический рефетч при фокусе окна / восстановлении связи                                               |

### Что создаёт `createApi`

```
apiSlice
├── .reducer           → для configureStore
├── .middleware        → для configureStore (обязательно!)
├── .reducerPath       → строка 'api'
├── .util              → утилиты (resetApiState, updateQueryData, prefetch, …)
└── автогенерируемые хуки:
    ├── useGetItemsQuery
    ├── useGetItemByIdQuery
    ├── useCreateItemMutation
    ├── useUpdateItemMutation
    └── useDeleteItemMutation
```

### Правило именования хуков

- `getItems` → `useGetItemsQuery`
- `getItemById` → `useGetItemByIdQuery`
- `createItem` → `useCreateItemMutation`
- `updateItem` → `useUpdateItemMutation`
- `deleteItem` → `useDeleteItemMutation`

Если endpoint называется `someAction`, хук будет `useSomeActionQuery` (для query) или `useSomeActionMutation` (для mutation).

---

## Список endpoints

| Endpoint      | Тип      | HTTP     | URL          | providesTags / invalidatesTags          |
| ------------- | -------- | -------- | ------------ | --------------------------------------- |
| `getItems`    | query    | `GET`    | `/posts`     | provides: `Items:LIST`, `Items:<id>`    |
| `getItemById` | query    | `GET`    | `/posts/:id` | provides: `Items:<id>`                  |
| `createItem`  | mutation | `POST`   | `/posts`     | invalidates: `Items:LIST`               |
| `updateItem`  | mutation | `PUT`    | `/posts/:id` | invalidates: `Items:<id>`, `Items:LIST` |
| `deleteItem`  | mutation | `DELETE` | `/posts/:id` | invalidates: `Items:<id>`, `Items:LIST` |

---

## Правила

1. **`providesTags`** указывается в query-эндпоинтах. Он сообщает RTK Query: «данные этого запроса помечены такими-то тегами».
2. **`invalidatesTags`** указывается в mutation-эндпоинтах. Он сообщает: «после успешного выполнения этого запроса перечисленные теги устарели».
3. RTK Query находит все **активные query**, чьи `providesTags` пересекаются с `invalidatesTags`, и **автоматически перезапрашивает** их.
4. Тег может быть:
   - строкой — `'Items'` (инвалидирует всё, что помечено `Items`);
   - объектом — `{ type: 'Items', id: 5 }` (точечно, конкретный элемент);
   - объектом с `id: 'LIST'` — тег для списка целиком.

### Что происходит в этом проекте

| Действие   | Инвалидирует                | Что перезапрашивается                                          |
| ---------- | --------------------------- | -------------------------------------------------------------- |
| Создание   | `Items:LIST`                | `useGetItemsQuery()`                                           |
| Обновление | `Items:<id>` + `Items:LIST` | `useGetItemsQuery()` + `useGetItemByIdQuery(id)`               |
| Удаление   | `Items:<id>` + `Items:LIST` | `useGetItemsQuery()` + (если открыт) `useGetItemByIdQuery(id)` |

Именно поэтому UI-список **обновляется сам** после любой мутации — это следствие связки `providesTags` ↔ `invalidatesTags`, а не ручной вызов `refetch()`.

### Соглашение об именах тегов

- `'Items'` в `tagTypes` — тип сущности.
- `{ type: 'Items', id: 'LIST' }` — тег «весь список».
- `{ type: 'Items', id: <number> }` — тег «конкретный элемент».

Если сущностей несколько (например, `Post`, `User`, `Comment`) — объявляйте отдельные `tagTypes` и не смешивайте их.

### Почему `providesTags` для списка — функция, а не константа

```js
// ❌ Так тоже можно, но тогда не будет точечной инвалидации
providesTags: ['Items'],

// ✅ Так лучше: список помечается и общим тегом LIST, и тегом на каждый id
providesTags: (result) =>
  result
    ? [
        ...result.map(({ id }) => ({ type: 'Items', id })),
        { type: 'Items', id: 'LIST' },
      ]
    : [{ type: 'Items', id: 'LIST' }],
```

Это позволяет при обновлении одного элемента перезапросить именно его, а не тянуть заново весь список с сервера.

---

## Чем RTK Query отличается от createAsyncThunk

| Критерий                           | `createAsyncThunk`                                                                                                | RTK Query                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Назначение                         | Универсальные асинхронные операции                                                                                | HTTP data-fetching                                                    |
| Объявление запроса                 | Вручную: `createAsyncThunk` + `fetch`/`axios`                                                                     | Декларативно: `builder.query` / `builder.mutation`                    |
| Состояние загрузки                 | Пишете в slice сами: `pending / fulfilled / rejected`                                                             | Готовые флаги: `isLoading`, `isFetching`, `isError`, `error`, `data`  |
| Кэш                                | Нет — храните где хотите                                                                                          | Нормализованный кэш с TTL (`keepUnusedDataFor`)                       |
| Дедупликация запросов              | Нет                                                                                                               | Автоматическая                                                        |
| Инвалидация                        | Нет                                                                                                               | Через `providesTags` / `invalidatesTags`                              |
| Хуки                               | Пишете сами через `useDispatch` / `useSelector`                                                                   | Автогенерация: `useGetItemsQuery`, `useCreateItemMutation`, …         |
| Поллинг                            | Вручную                                                                                                           | `pollingInterval`                                                     |
| Рефетч при фокусе окна / reconnect | Вручную                                                                                                           | `refetchOnFocus`, `refetchOnReconnect`                                |
| Оптимистичные апдейты              | Вручную                                                                                                           | `onQueryStarted` + `api.util.updateQueryData`                         |
| Boilerplate                        | Много                                                                                                             | Минимум                                                               |
| Где выбирать                       | Сложная асинхронная логика, не связанная с HTTP: websockets, отложенные сценарии, оркестрация нескольких действий | CRUD, REST, списки, детальные страницы, любые однотипные HTTP-запросы |

### Когда что использовать

- **RTK Query** — 90% случаев: любой CRUD, списки, детальные страницы, справочники, автокомплиты.
- **`createAsyncThunk`** — когда запрос является лишь шагом в сложной логике: последовательные цепочки, запросы, зависящие от многих условий, работа с WebSocket / SSE, файловые операции с прогрессом.
