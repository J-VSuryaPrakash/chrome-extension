import { useState } from "react"
import { useNavigate } from "react-router-dom"
function Login(){

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch("http://localhost:8000/api/v1/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            }),
            credentials: "include"
        })

        if(response){
            const data = await response.json()
            console.log(data);
            if(data.statusCode === 200){
                navigate("/dashboard")
            }
            
        }
    }

    return(
        <>
        
        <div className="w-screen h-screen bg-blue-950 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">Login</h1>
                <form onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label htmlFor="email" className="mb-2 font-semibold text-blue-950">Email</label>
                    <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 mb-2 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="password" className="mb-2 font-semibold text-blue-950">Password</label>
                    <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                </div>
                <div>
                    <button
                    type="submit"
                    className="w-full bg-blue-600 mt-6 hover:bg-blue-700 hover:cursor-pointer text-white font-semibold py-2 rounded-md transition-colors"
                    >
                    Login
                    </button>
                </div>
                </form>
                <p className="text-center mt-4" >Don't have an account?</p>
                    <button
                        type="submit"
                        onClick={() => navigate("/register")}
                        className="w-full bg-blue-600 mt-3 hover:bg-blue-700 hover:cursor-pointer text-white font-semibold py-2 rounded-md transition-colors"
                    >
                        Register
                    </button>
            </div>
            
        </div>
        
        </>
    )

}

export default Login