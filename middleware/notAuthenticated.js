//IF the user have a token, we send it to index
export default function({store,redirect}){
    store.dispatch('readToken')

    if (store.state.auth) {
        return redirect('/dashboard')
    }
}