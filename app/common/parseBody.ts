export const parseBody = async (response: Response) => {
    let result :string = '';
    if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        }
    }
    return result;
}