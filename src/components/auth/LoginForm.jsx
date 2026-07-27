import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validations/authSchema";
import {Link, useNavigate} from "react-router-dom";
import { loginUser } from "../../services/authService";
import { saveToken } from "../../utils/auth";
function LoginForm(){
    const navigate = useNavigate();
    const {
        register, handleSubmit, formState:{errors},
    } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);

      saveToken(response.token);

      alert(response.message);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };
    return (
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-indigo-600">
                ChatSphere
            </h1>
            <p className="text-center text-gray-500 mt-2">
                Welcome Back
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                <div className="mb-4">
                    <label className="block mb-2 font-medium">
                        Email : 
                    </label>
                    <input 
                    type="email" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Enter your email"
                    {...register("email")}
                    />
                    <p className="text-red-500 text-sm mb-4">
                        {errors.email?.message}
                    </p>
                </div>
                <div className="mb-6">
                    <label  className="block mg-2 font-medium">
                        Password : 
                    </label>
                    <input 
                    type="password" 
                    className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Enter your password"
                    {...register("password")}
                    />
                    <p className="text-red-500 text-sm mb-4">
                        {errors.password?.message}
                    </p>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
                    Login
                </button>
            </form>
            <p className="text-center mt-6">
                Don't have an account ? 
                <Link to = "/register" className="text-indigo-600 ml-2 font-semibold">
                Register
                </Link>
            </p>
        </div>
    );
}
export default LoginForm;