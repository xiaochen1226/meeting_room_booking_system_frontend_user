import { InboxOutlined } from "@ant-design/icons"
import { Button, message } from "antd"
import { DraggerProps } from "antd/es/upload"
import Dragger from "antd/es/upload/Dragger"

export interface HeadPicUploadProps {
    value?: string
    onChange?: Function
}


let onChange: Function

const props: DraggerProps ={
    name: 'file',
    action: 'http://localhost:3000/user/upload',
    onChange(info) {
        const {status} = info.file
        if(status === 'done'){
            onChange(info.file.response.data);
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
        <img src={'http://10.45.28.38:3000/' + props.value } alt="头像" width="100px" height="100px" />
        {dragger}
    </div> : <div>
        {dragger}
    </div>
}