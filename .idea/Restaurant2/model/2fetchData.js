export const fetchData = async (url, options) => {
    const resp = await fetch(url, options);
    if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
    }
    return await resp.json();
};