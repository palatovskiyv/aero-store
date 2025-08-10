export const useAppStore = defineStore('app', () => {
const fetchData = async () => {
    const { data } = await useFetch('https://api.example.com/data')
    return data.value
}
    return { fetchData }
})