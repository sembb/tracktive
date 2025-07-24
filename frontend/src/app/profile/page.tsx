'use client';

import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import SubmitProfileChange from './SubmitProfileChange';

export default function JSValidationForm() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      flatpickr('#birth_date', {
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
    <div className="bg-slygray w-full rounded-lg shadow-base-300/20 shadow-sm container mx-auto">
      <h5 className="bg-base-300/10 rounded-t-lg p-4 text-xl font-bold">JS Validation</h5>
      <div className="w-full p-4">
        <form className="needs-validation peer grid gap-y-4" noValidate ref={formRef}>
          {/* Account Details */}
          <div className="w-full">
            <h6 className="text-lg font-semibold">1. Account Details</h6>
            <hr className="mb-4 mt-2" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="label-text" htmlFor="userEmail">Email</label>
              <input
                id="userEmail"
                name="email" // ✅ added
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
                  name="password" // ✅ added
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
              <label className="label-text" htmlFor="avatar_url">Profile Pic</label>
              <input
                id="avatar_url"
                name="avatar_url" // ✅ added
                type="file"
                className="input"
                required
              />
              <span className="error-message">Please select the file</span>
              <span className="success-message">Looks good!</span>
            </div>
            <div>
              <label className="label-text" htmlFor="birth_date">DOB</label>
              <input
                id="birth_date"
                name="birth_date" // ✅ added
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
              <label className="label-text" htmlFor="country">Pick your Country</label>
              <select
                className="select"
                id="country"
                name="country" // ✅ added
                aria-label="Select Country"
                required
              >
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
                <input
                  type="radio"
                  id="male"
                  name="gender" // ✅ changed from radio-0
                  value="male" // ✅ added
                  className="radio radio-primary"
                  required
                />
                <label className="label-text text-base" htmlFor="male">Male</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="female"
                  name="gender" // ✅ changed from radio-0
                  value="female" // ✅ added
                  className="radio radio-primary"
                  required
                />
                <label className="label-text text-base" htmlFor="female">Female</label>
              </div>
              <span className="error-message">Please select your Gender</span>
              <span className="success-message">Looks good!</span>
            </div>
          </div>

          <div className="w-full">
            <label className="label-text" htmlFor="bio">Bio</label>
            <textarea
              className="textarea min-h-20 resize-none"
              id="bio"
              name="bio" // ✅ added
              placeholder="Hello!!!"
              required
            ></textarea>
            <span className="error-message">Please write few words</span>
            <span className="success-message">Looks good!</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="userSwitch"
                name="subscribe_emails" // ✅ added
                className="switch switch-primary"
                required
              />
              <label className="label-text text-base" htmlFor="userSwitch">
                Send me related emails
              </label>
            </div>
            <span className="error-message">Please select your preference</span>
            <span className="success-message">Looks good!</span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                id="userAgre"
                name="agree_terms" // ✅ added
                required
              />
              <label className="label-text text-base" htmlFor="userAgre">
                Agree to our terms and conditions
              </label>
            </div>
            <span className="error-message">Please confirm our T&amp;C</span>
            <span className="success-message">Looks good!</span>
          </div>

          {/* Submit button */}
          <div className="mt-4">
            <SubmitProfileChange formRef={formRef} />
          </div>
        </form>
      </div>
    </div>
  );
}
