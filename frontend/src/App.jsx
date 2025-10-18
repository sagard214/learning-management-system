import { use, useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Notfound from './pages/Notfound'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Denied from './pages/Denied'
import CourseList from './pages/Course/CourseList'
import CourseDescription from './pages/Course/CourseDescription'
import CreateCourse from './pages/Course/CreateCourse'
import RequireAuth from './components/Auth/RequireAuth'
import Profile from './pages/User/Profile'
import Editprofile from './pages/User/EditProfile'
import Checkout from './pages/Payment/Checkout'
import CheckoutSuccess from './pages/Payment/CheckoutSuccess'
import CheckoutFailure from './pages/Payment/CheckoutFailure'
import DisplayLectures from './pages/Dashboard/DisplayLectures'
import AddLecture from './pages/Dashboard/AddLecture'
import Aboutus from './pages/Aboutus'

function App() {
   
  return (
   <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<Aboutus />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/signin' element={<Signin />} />
      <Route path='/courses' element={<CourseList />} />
      <Route path='/course/description' element={<CourseDescription />} />

      <Route element={<RequireAuth allowedRoles={["ADMIN", "USER"]} />}>
        <Route path='/user/profile' element={<Profile />} />
        <Route path='/user/editprofile' element={<Editprofile />} />

        <Route path='/checkout' element={<Checkout />} />
        <Route path='/checkout/success' element={<CheckoutSuccess />} />
        <Route path='/checkout/fail' element={<CheckoutFailure />} />

        <Route path='/course/displaylectures' element={<DisplayLectures />} />
      </Route>

      <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
        <Route path='/course/create' element={<CreateCourse />} />
        <Route path="/course/addlecture" element={<AddLecture />} />
      </Route>

      <Route path='/denied' element={<Denied />} />
      <Route path='*' element={<Notfound />} />
   </Routes>
  )
}

export default App

