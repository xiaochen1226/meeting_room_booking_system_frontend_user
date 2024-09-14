import axios, { AxiosRequestConfig } from "axios";
import { RegisterUser } from "../page/register/Register";
import { UpdatePassword } from "../page/update_password/UpdatePassword";
import { UserInfo } from "../page/update_info/update_info";
import { message } from "antd";
import { SearchBooking } from "../page/booking-history/booking-history";
import dayjs from "dayjs";
import { CreateBooking } from "../page/meeting-room-list/create-booking-modal";

const axiosInstance = axios.create({
    baseURL: 'http://39.108.118.4:82/api',
    // baseURL: 'http://localhost:3000',
    timeout: 3000
})

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access_token')

    if(accessToken){
        config.headers.authorization = 'Bearer '+ accessToken
    }
    return config
})

interface PendingTask {
    config: AxiosRequestConfig
    resolve: Function
}

let refreshing = false
const queue: PendingTask[] = []

axiosInstance.interceptors.response.use((response) => {
    return response
}, async (error) => {
    if(!error.response){
        return Promise.reject(error)
    }
    let {data,config} = error.response

    if(refreshing){
        return new Promise((resolve) =>{
            queue.push({config,resolve})
        })
    }

    if(data.code === 401 && !config.url.includes('/user/refresh')){
        refreshing = true

        const res = await refreshToken()
        refreshing = false

        if(res.status === 200 ){
            queue.forEach(({config,resolve}) => {
                resolve(axiosInstance(config))
            })
            return axiosInstance(config)
        } else {
            message.error(res.data)
            setTimeout(() => {
                window.location.href = '/login'
            }, 1500);
        }
    } else {
        return error.response
    }
})

async function refreshToken() {
    if(!localStorage.getItem('refresh_token')){
        return {status:401,data: '用户未登录'}
    }
    const res = await axiosInstance.get('/user/refresh',{
        params: {
            refresh_token: localStorage.getItem('refresh_token')
        }
    })
    localStorage.setItem('access_token',res.data.access_token || '')
    localStorage.setItem('refresh_token', res.data.refresh_token || '')
    return res
}

export async function login(username:string, password: string) {
    return await axiosInstance.post('/user/login',{
        username,
        password
    })
}

export async function registerCaptcha(email:string) {
    return await axiosInstance.get('/user/register-captcha', {
        params: {
            address: email
        }
    })
}

export async function register(registerUser: RegisterUser) {
    return await axiosInstance.post('/user/register',registerUser)
}

export async function updatePasswordCaptcha(email:string) {
    return await axiosInstance.get('/user/update_password/captcha', {
        params: {
            address: email
        }
    })
}

export async function updatePassword(data: UpdatePassword) {
    return await axiosInstance.post('/user/update_password', data)
}

export async function getUserInfo() {
    return await axiosInstance.get('/user/info')
}

export async function  updateInfo(data:UserInfo) {
    return await axiosInstance.post('/user/update', data)
}

export async function updateUserInfoCaptcha() {
    return await axiosInstance.get('/user/update/captcha')
}

export async function searchMeetingRoomList(name: string, capacity: number, equipment: string, pageNo: number, pageSize: number) {
    return await axiosInstance.get('/meeting-room/list', {
        params: {
            name,
            capacity,
            equipment,
            pageNo,
            pageSize
        }
    });
}

export async function bookingList(searchBooking: SearchBooking, pageNo: number, pageSize: number) {

    let bookingTimeRangeStart;
    let bookingTimeRangeEnd;
    
    if(searchBooking.rangeStartDate && searchBooking.rangeStartTime) {
        const rangeStartDateStr = dayjs(searchBooking.rangeStartDate).format('YYYY-MM-DD');
        const rangeStartTimeStr = dayjs(searchBooking.rangeStartTime).format('HH:mm');
        bookingTimeRangeStart = dayjs(rangeStartDateStr + ' ' + rangeStartTimeStr).valueOf()
    }

    if(searchBooking.rangeEndDate && searchBooking.rangeEndTime) {
        const rangeEndDateStr = dayjs(searchBooking.rangeEndDate).format('YYYY-MM-DD');
        const rangeEndTimeStr = dayjs(searchBooking.rangeEndTime).format('HH:mm');
        bookingTimeRangeEnd = dayjs(rangeEndDateStr + ' ' + rangeEndTimeStr).valueOf()
    }

    return await axiosInstance.get('/booking/list', {
        params: {
            username: searchBooking.username,
            meetingRoomName: searchBooking.meetingRoomName,
            meetingRoomPosition: searchBooking.meetingRoomPosition,
            bookingTimeRangeStart,
            bookingTimeRangeEnd,
            pageNo: pageNo,
            pageSize: pageSize
        }
    });
}

export async function unbind(id: number) {
    return await axiosInstance.get('/booking/unbind/' + id);
}

export async function urge(id: number) {
    return await axiosInstance.get('/booking/urge/' + id);
}

export async function bookingAdd(booking: CreateBooking) {
    const rangeStartDateStr = dayjs(booking.rangeStartDate).format('YYYY-MM-DD');
    const rangeStartTimeStr = dayjs(booking.rangeStartTime).format('HH:mm');
    const startTime = dayjs(rangeStartDateStr + ' ' + rangeStartTimeStr).valueOf()

    const rangeEndDateStr = dayjs(booking.rangeEndDate).format('YYYY-MM-DD');
    const rangeEndTimeStr = dayjs(booking.rangeEndTime).format('HH:mm');
    const endTime = dayjs(rangeEndDateStr + ' ' + rangeEndTimeStr).valueOf()

    return await axiosInstance.post('/booking/add', {
        meetingRoomId: booking.meetingRoomId,
        startTime,
        endTime,
        note: booking.note            
    });
}

export async function presignedUrl(fileName:string) {
    return axiosInstance.get(`/minio/presignedUrl?name=${fileName}`)
}