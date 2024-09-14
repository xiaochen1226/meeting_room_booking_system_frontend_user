import { InboxOutlined } from "@ant-design/icons"
import { Button, message } from "antd"
import { DraggerProps } from "antd/es/upload"
import Dragger from "antd/es/upload/Dragger"
import { presignedUrl } from "../../interface/interfaces"
import axios from "axios"

export interface HeadPicUploadProps {
    value?: string
    onChange?: Function
}


let onChange: Function

const props: DraggerProps ={
    name: 'file',
    action: async (file) => {
        const res = await presignedUrl(file.name)
        return res.data.data
    },
    async customRequest(options) {
        const {onSuccess,file,action} = options
        const res = await axios.put(action,file)
        onSuccess!(res.data)
    },
    onChange(info) {
        const {status} = info.file
        if(status === 'done'){
            onChange('http://39.108.118.4:9000/meeting-room-booking-system/'+ info.file.name);
            message.success(`${info.file.name} 文件上传成功`)
        } else if(status ==='error'){
            message.error(`${info.file.name} 文件上传失败`)
        }
    }
}

const dragger = <Dragger {...props}>
    <p className="ant-upload-drag-icon">
        <InboxOutlined />
    </p>
    <p className="ant-upload-text">点击或拖动文件到这个区域来上传</p>
</Dragger>

export function HeadPicUpload(props: HeadPicUploadProps){
    onChange = props.onChange!
    return props?.value ? <div>
        <img src={props.value } alt="头像" width="100px" height="100px" />
        {dragger}
    </div> : <div>
        {dragger}
    </div>
}