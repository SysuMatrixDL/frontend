import { Loader, Text, Table, Button, Drawer, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { parseBody } from '~/common/parseBody';
import { notifications } from '@mantine/notifications';

type ImageProp = {
  iid: number,
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

enum ImageOp {
  NONE = 'NONE',
  DELETE = '删除'
}

export default function Images () {
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<{d: DeviceProp, i: ImageProp}[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [operating, setOperating] = useState(false);
  const [op_prop, setOpProp] = useState<{op: ImageOp, iid: number}>({op: ImageOp.NONE, iid: 0});

  const operateImage = async () => {
    try {
      const response : Response = await fetch('/images/delete/' + op_prop.iid, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : {status: number, error: string} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || parsedResult.error) {
        console.error(`Operate image failed: ${parsedResult.error}`);
        throw new Error(`Operate image failed: ${parsedResult.error}`);
      }
      setOpProp({op: ImageOp.NONE, iid: 0});
      refreshTable();
      notifications.show({
        title: '操作成功!',
        color: 'rgba(0, 255, 0, 0.5)',
        message: `成功${op_prop.op}镜像${op_prop.iid}`
      });
      close();
    } catch (err: any) {
      notifications.show({
        title: '操作失败!',
        color: 'rgba(255, 0, 0, 0.5)',
        message: err.error
      });
    }
    setOperating(false);
  }

  const getImageList = async () => {
    let ret : string[] = [];
    try {
      const response : Response = await fetch('/images', {
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
      iid: Number(iid),
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
    var data: {d: DeviceProp, i: ImageProp}[] = await Promise.all(images.map(async (iid) => {
      const image_prop = await getImageProperty(iid);
      image_prop.iid = Number(iid);
      const device_prop = await getDeviceProperty(image_prop.did);
      return {d: device_prop, i: image_prop};
    }));
    setData(data);
    setFetching(false);
  }

  useEffect(() => {
    refreshTable();
  }, []);

  return (fetching ? <div className='flex h-full items-center justify-center'><Loader color="rgba(255, 31, 31, 0.6)" size="xl" /></div> : <>
    <Table data={{
      caption: data.length > 0 ? '' : '您还没有创建任何镜像',
      head: [
        <p className='text-center'>镜像ID/名称</p>,
        <p className='text-center'>大小</p>,
        <p className='text-center'>宿主机详情</p>,
        <p className='text-center'>公开/私有</p>,
        <p className='text-center'>操作</p>
      ],
      body: data.map( ({d, i}) => {

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
        }];

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
            <Text fw={700} c={i.public ? 'teal.6' : 'blue.6'}>
              {i.public ? '公开' : '私有'}
            </Text>
          </div>,
          <div className='flex flex-col gap-4'>
            <Button
              variant="light"
              loading={op_prop.op != ImageOp.NONE}
              onClick={() => {
                setOpProp({
                  op: ImageOp.DELETE,
                  iid: i.iid
                });
                open();
              }}>
              删除镜像
            </Button>
          </div>
        ];
      })
    }}/>
    <Drawer opened={opened} onClose={close} position="bottom" closeOnClickOutside={false} closeOnEscape={false} closeButtonProps={{disabled: true}}>
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col justify-center space-y-4'>
          <Text size="xl">您确定要{op_prop.op}镜像{op_prop.iid}吗?</Text>
          <Image h={200} w="auto" fit="contain" src="/taffy13.png"/>
          <Button
            variant="light"
            color="rgba(255, 0, 0, 0.5)"
            loading={operating}
            onClick={() => {
              setOperating(true);
              operateImage();
            }}>
            我确认
          </Button>
          <Button
            variant="light"
            color="rgba(0, 0, 255, 0.5)"
            disabled={operating}
            onClick={() => {
              setOpProp({op: ImageOp.NONE, iid: 0});
              close();
            }}>
            取消
          </Button>
        </div>
      </div>
    </Drawer>
  </>);
}