'use client';

import { useEffect } from 'react';
import flatpickr from 'flatpickr';

export default function JSValidationForm() {
      useEffect(() => {
    // Initialize flatpickr
    if (typeof window !== 'undefined') {
      flatpickr('#jsPickr', {
        allowInput: true,
        monthSelectorType: 'static',
      });

      const forms = document.querySelectorAll('.needs-validation');

      Array.from(forms).forEach((form) => {
        form.addEventListener(
          'submit',
          (event) => {
            if (!form.checkValidity()) {
              event.preventDefault();
              event.stopPropagation();

              const firstInvalidElement = form.querySelector(':invalid');
              if (firstInvalidElement) {
                firstInvalidElement.focus();
              }
            }
            form.classList.add('validate');
          },
          false
        );
      });
    }
  }, []);
  return (
    <div className="bg-base-100 w-full rounded-lg shadow-base-300/20 shadow-sm">
      <h5 className="bg-base-300/10 rounded-t-lg p-4 text-xl font-bold">JS Validation</h5>
      <div className="w-full p-4">
        <form className="needs-validation peer grid gap-y-4" noValidate>
          {/* Account Details */}
          <div className="w-full">
            <h6 className="text-lg font-semibold">1. Account Details</h6>
            <hr className="mb-4 mt-2" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="label-text" htmlFor="firstName">First Name</label>
              <input id="firstName" type="text" placeholder="John" className="input" required />
              <span className="error-message">Please enter your name.</span>
              <span className="success-message">Looks good!</span>
            </div>
            <div>
              <label className="label-text" htmlFor="lastName">Last Name</label>
              <input id="lastName" type="text" placeholder="Doe" className="input" required />
              <span className="error-message">Please enter your last name.</span>
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          {/* Email and Password */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="label-text" htmlFor="userEmail">Email</label>
              <input
                id="userEmail"
                type="email"
                className="input"
                placeholder="john@gmail.com"
                aria-label="john@gmail.com"
                required
              />
              <span className="error-message">Please enter a valid email</span>
              <span className="success-message">Looks good!</span>
            </div>
            <div>
              <label className="label-text" htmlFor="userPassword">Password</label>
              <div className="input">
                <input
                  id="userPassword"
                  type="password"
                  className="grow"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  data-toggle-password='{"target": "#userPassword"}'
                  className="my-auto ms-4 block cursor-pointer"
                >
                  <span className="icon-[tabler--eye] text-base-content/80 password-active:block hidden size-4 shrink-0"></span>
                  <span className="icon-[tabler--eye-off] text-base-content/80 password-active:hidden block size-4 shrink-0"></span>
                </button>
              </div>
              <span className="error-message">Please enter a valid password</span>
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          {/* Personal Info */}
          <div className="w-full">
            <h6 className="text-lg font-semibold">2. Personal Info</h6>
            <hr className="mb-4 mt-2" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="label-text" htmlFor="userProfile">Profile Pic</label>
              <input id="userProfile" type="file" className="input" required />
              <span className="error-message">Please select the file</span>
              <span className="success-message">Looks good!</span>
            </div>
            <div>
              <label className="label-text" htmlFor="jsPickr">DOB</label>
              <input
                id="jsPickr"
                type="text"
                className="input"
                placeholder="YYYY-MM-DD"
                required
              />
              <span className="error-message">Please select your DOB</span>
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="label-text" htmlFor="userCountry">Pick your Country</label>
              <select className="select" id="userCountry" aria-label="Select Country" required>
                <option value="">Select Country</option>
                <option value="usa">USA</option>
                <option value="uk">UK</option>
                <option value="france">France</option>
                <option value="australia">Australia</option>
                <option value="spain">Spain</option>
              </select>
              <span className="error-message">Please select your country</span>
              <span className="success-message">Looks good!</span>
            </div>
            <div>
              <div className="label-text">Gender</div>
              <div className="flex items-center gap-2">
                <input type="radio" id="male" name="radio-0" className="radio radio-primary" required />
                <label className="label-text text-base" htmlFor="male">Male</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="female" name="radio-0" className="radio radio-primary" required />
                <label className="label-text text-base" htmlFor="female">Female</label>
              </div>
              <span className="error-message">Please select your Gender</span>
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          <div className="w-full">
            <label className="label-text" htmlFor="userBio">Bio</label>
            <textarea
              className="textarea min-h-20 resize-none"
              id="userBio"
              placeholder="Hello!!!"
              required
            ></textarea>
            <span className="error-message">Please write few words</span>
            <span className="success-message">Looks good!</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="userSwitch" className="switch switch-primary" required />
              <label className="label-text text-base" htmlFor="userSwitch">
                Send me related emails
              </label>
            </div>
            <span className="error-message">Please select your preference</span>
            <span className="success-message">Looks good!</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="checkbox checkbox-primary" id="userAgre" required />
              <label className="label-text text-base" htmlFor="userAgre">
                Agree to our terms and conditions
              </label>
            </div>
            <span className="error-message">Please confirm our T&amp;C</span>
            <span className="success-message">Looks good!</span>
          </div>

          {/* Submit button */}
          <div className="mt-4">
            <button type="submit" name="submitButton" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
