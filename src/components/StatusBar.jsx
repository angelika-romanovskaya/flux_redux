export const StatusBar = ({ loading, error, onRetry }) => {
	if (loading) {
		return <p className="status">Загрузка…</p>;
	}

	if (error) {
		return (
			<div className="status error">
				<p>Ошибка: {error}</p>
				<button onClick={onRetry}>Повторить запрос</button>
			</div>
		);
	}

	return null;
};
