import { Text, Table, Loader, Avatar } from '@mantine/core';
import { useEffect, useState } from 'react';
import { parseBody } from '~/common/parseBody';

type ImageProp = {
  iid: string
  did: string,
  name: string,
  public: boolean,
  user: string,
  size: number
}

type DeviceProp = {
  total_cpu: number,
  used_cpu: number,
  cpu_name: string,
  total_memory: number,
  used_memory: number,
  gpus: {
    gid: number
    gpu_type: string
  }[]
  gpu_used: number[],
  ip: string
}

export default function Community () {
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<{i: ImageProp, d: DeviceProp}[]>([]);

  const getImageList = async () => {
    let ret : string[] = [];
    try {
      const response : Response = await fetch('/images/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : string[] = JSON.parse(await parseBody(response));

      if (!response.ok) {
        console.error('Get images failed');
        throw new Error('Get images failed');
      }

      ret =  parsedResult;
    } catch (err: any) {
      // TODO
    }
    return ret;
  }

  const getImageProperty = async (iid: string) => {
    let property : ImageProp = {
      iid: "Error",
      did: "Error",
      name: "Error",
      public: false,
      user: "Error",
      size: 0
    }
    try {
      const response : Response = await fetch('/images/property/'+iid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : ImageProp = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get image property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  const getDeviceProperty = async (did: string) => {
    let property : DeviceProp = {
      total_cpu: 0,
      used_cpu: 0,
      cpu_name: "Error",
      total_memory: 0,
      used_memory: 0,
      gpus: [],
      gpu_used: [],
      ip: "Error",
    }
    try {
      const response : Response = await fetch('/devices/property/'+did, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : DeviceProp = JSON.parse(await parseBody(response));

      if (!response.ok) {
        throw new Error('Get image property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  const refreshTable = async () => {
    setFetching(true);
    const images = await getImageList();
    var _data: {i: ImageProp, d: DeviceProp}[] = await Promise.all(images.map(async (iid) => {
      const image_prop = await getImageProperty(iid);
      image_prop.iid = iid;
      const device_prop = await getDeviceProperty(image_prop.did);
      return {i: image_prop, d: device_prop};
    }));
    setData(_data);
    setFetching(false);
  }

  useEffect(() => {
    refreshTable();
  }, []);

  let _body = data.map(({i, d}) => {
    // NOTE: 目前默认每个worker节点只有一种GPU
    const host_data = [{
      title: '设备ID',
      label: i.did
    },{
      title: 'IP',
      label: d.ip
    },{
      title: 'CPU',
      label: d.cpu_name
    },{
      title: 'GPU',
      label: d.gpus.length > 0 ? d.gpus[0].gpu_type : '无GPU'
    }]

    return [
      <div className='text-center'>
        <Text fw={700}>
          {i.name}
        </Text>
        <Text size="sm" c="gray.6">
          ID: {i.iid}
        </Text>
      </div>,
      <div className='text-center'>
        <Text fw={700} c="blue.6">
          {(i.size / 1024 ** 2) > 1024 ? (i.size / 1024 ** 3).toFixed(2) + 'GiB' : (i.size / 1024 ** 2).toFixed(2) + 'MiB'}
        </Text>
      </div>,
      <div className=''>
        <Table variant="vertical" layout="auto">
          <Table.Tbody>
            {host_data.map((value => { return (
              <Table.Tr>
              <Table.Th w={85}>{value.title}</Table.Th>
              <Table.Td>{value.label}</Table.Td>
              </Table.Tr>
            )}))}
          </Table.Tbody>
        </Table>
      </div>,
      <div className='text-center'>
          {i.user == 'public' ?
            <Text fw={700} c="teal.6">公共镜像</Text>:
            <div className='flex justify-center flex-col items-center'>
              <Avatar key={i.user} name={i.user} color="initials" allowedInitialsColors={['blue', 'red']} radius="xl"/>
              <Text fw={500} c="gray.6">{i.user}</Text>
            </div>
          }
      </div>
    ];
  });

  return (
    fetching ? <div className='flex h-full items-center justify-center'><Loader color="rgba(255, 31, 31, 0.6)" size="xl" /></div> : <Table data={{
      head: [
        <p className='text-center'>镜像ID/名称</p>,
        <p className='text-center'>大小</p>,
        <p className='text-center'>宿主机详情</p>,
        <p className='text-center'>创建者</p>
      ],
      body: _body
    }} />
  );
}