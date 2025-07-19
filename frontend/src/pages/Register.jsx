import { useState } from "react"
import { useNavigate } from "react-router-dom"
function Register(){

    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault()
        const response = await fetch("http://localhost:8000/api/v1/user/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name, username, email,
                password
            })
        })

        if(response){
            const resData = await response.json()
            console.log(resData)
            if(resData.statusCode === 200){
                navigate("/dashboard")
            } else {
                console.error("Registration failed:", resData.message);
            }
        }
    }

    return(
        <>
        
        <div className="w-screen h-screen bg-blue-950 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-80">
                <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">Register</h1>
                <form onSubmit={handleSubmit}>
                <div className="flex flex-col">
                    <label htmlFor="name" className="mb-2 font-semibold text-blue-950">Name</label>
                    <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-gray-300 mb-2 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="username" className="mb-2 font-semibold text-blue-950">Username</label>
                    <input
                    type="text"
                    name="username"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-gray-300 mb-2 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                </div>
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
                    Register
                    </button>
                </div>
                </form>
            </div>
            
        </div>
        
        </>
    )

}

export default Register