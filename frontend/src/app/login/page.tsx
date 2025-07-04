"use client";

import { useState } from "react";
import { useAuth } from "../../../lib/stores/user";
import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
	
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    console.log('API URL:', apiUrl); // Debugging output

	const res1 = await fetch(`${apiUrl}/sanctum/csrf-cookie`, {
		credentials: "include",
	});
    const res = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // belangrijk voor cookies
      body: JSON.stringify({ email, password }),
    });

	

    if (res.ok) {
      const data = await res.json();
	  console.log('Setting user:', data.user);
      useAuth.getState().setUser(data.user)
	  console.log('User set');
      router.push('/'); 
      // Hier kan je token opslaan of user status bijhouden
    } else {
      setMessage("Login mislukt");
    }
  }

  return (

    <div className="bg-white flex h-auto min-h-screen items-center justify-center overflow-x-hidden py-10">
		<div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="absolute">
				<svg
					width="612"
					height="697"
					viewBox="0 0 612 697"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					{/* SVG paths here, exactly as in your original */}
				</svg>
			</div>
			<div className="bg-white shadow-base-300/20 z-10 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
				<div className="flex items-center gap-3">
					<Image
					src="/images/Logosmall.png"
					width={32}
					height={32}
					alt="brand-logo"
					/>
					<h2 className="text-foreground text-xl font-bold">Tracktive</h2>
				</div>
				<div>
					<h3 className="text-foreground mb-1.5 text-2xl font-semibold">
					Sign in to Tracktive
					</h3>
					<p className="text-foreground/80">
					Share your experiences for all to see
					</p>
				</div>
				<div className="space-y-4">
					<form className="mb-4 space-y-4" onSubmit={handleLogin}>
					<div>
						<label className="label-text" htmlFor="userEmail">
						Email address*
						</label>
						<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="input bg-white"
						/>
					</div>
					<div>
						<label className="label-text" htmlFor="userPassword">
						Password*
						</label>
						<div className="input relative flex items-center bg-white">
							<input
      type={showPassword ? "text" : "password"}
      placeholder="Wachtwoord"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      className="flex-grow"
							/>
    <button
      type="button"
      className="absolute right-2"
      aria-label="toggle password visibility"
      onClick={() => setShowPassword((prev) => !prev)}
    >
      {showPassword ? (
        <span className="icon-[tabler--eye-off] size-5"></span>
      ) : (
        <span className="icon-[tabler--eye] size-5"></span>
      )}
    </button>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								className="checkbox checkbox-primary"
								id="rememberMe"
							/>
							<label className="label-text text-foreground/80" htmlFor="rememberMe">
								Remember Me
							</label>
						</div>
						<a href="#" className="link link-animated link-primary font-normal">
						Forgot Password?
						</a>
					</div>
					<button className="btn btn-lg btn-primary btn-gradient btn-block" type="submit">
						Sign in to Tracktive
					</button>
					</form>
					<p className="text-foreground/80 mb-4 text-center">
					New on our platform?{' '}
					<Link className="link link-animated link-primary font-normal" href="/register">
						Create an account
					</Link>
					</p>
					<div className="divider">or</div>
					<button className="btn btn-text btn-block">
					<Image
						src="/images/google-icon.webp"
						alt="google icon"
						width={20}
						height={20}
						className="object-cover"
					/>
					Sign in with Google
					</button>
				</div>
			</div>
		</div>
    </div>
  );
}