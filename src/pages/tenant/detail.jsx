import React, { useEffect, useState } from 'react'
import {Descriptions, Tag} from "antd";
import {TenantUsers} from "./users";
import { useParams } from 'react-router-dom'
import {getTenantDetail} from "../../api/eiam/tenant";
import { Breadcrumb } from "../../components/Breadcrumb";


export const TenantDetail = ()=>{
    const { id } = useParams()
    const [tenantInfo,setTenantInfo] = useState({})

    useEffect(() => {
        handleGetTenantInfo();
    }, [id]);

    const handleGetTenantInfo = async ()=>{
        try {
            const res = await getTenantDetail(id)
            setTenantInfo(res || {});
        } catch (error) {
            console.error(error)
        }
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp); // eiam 时间戳为毫秒
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    const statusTag = (status) => {
        if (status === 1) return <Tag color="blue">启用</Tag>;
        if (status === 2) return <Tag color="red">禁用</Tag>;
        return <Tag>未知</Tag>;
    };

    const itemsDescriptions = [
        {
            key: '1',
            label: '租户名称',
            children: tenantInfo.name || '-',
        },
        {
            key: '2',
            label: '租户编码',
            children: tenantInfo.code || '-',
        },
        {
            key: '3',
            label: '域名',
            children: tenantInfo.domain || '-',
        },
        {
            key: '4',
            label: '状态',
            children: statusTag(tenantInfo.status),
        },
        {
            key: '5',
            label: '创建时间',
            children: formatTimestamp(tenantInfo.ctime),
        },
    ];

    return(
        <>
            <Breadcrumb items={['租户管理', '详情']} />
            <div style={{textAlign:'left'}}>
                <Descriptions title={"基本信息"} bordered items={itemsDescriptions} />

                <div style={{marginTop:'20px'}}>
                    <span style={{fontSize:'16px',color:'var(--text-primary)',fontWeight:'600'}}>成员管理</span>
                    <div style={{ marginTop: '16px' }}>
                        <TenantUsers tenantInfo={tenantInfo}/>
                    </div>
                </div>
            </div>
        </>
    )
}
