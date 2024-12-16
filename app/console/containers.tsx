"use client"

import { Loader, Text, Table, CopyButton, Button, NavLink, Image, Drawer, Modal, Input, CloseButton, TextInput, SegmentedControl, Center, rem, PasswordInput, Container } from '@mantine/core';
import { IconActivity, IconCopy, IconCheck, IconBrandPython, IconChartHistogram, IconEye, IconLock  } from '@tabler/icons-react';
import { InlineCodeHighlight } from '@mantine/code-highlight';
import { SetStateAction, useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { parseBody } from '../common/parseBody';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';


type ContainerData = {
  cid: number,
  status: string,
  name: string,
  cpu: string,
  memory: string,
  portssh: string,
  portjupyter: string,
  porttsb: string,
  passwd: string,
  ip: string,
  cpu_name: string,
  gpu_type: string
}

enum ContainerStatus {
  UKNOWN = 'Unknown',
  STOP = '未运行',
  RUNNING = '运行中',
  STARTING = '启动中',
  STOPPING = '停止中',
  DELETING = '删除中'
}

export default function Containers () {
  const [fetching, setFetching] = useState(true);
  const [containers_data, setContainersData] = useState<ContainerData[]>([]);
  const [containers_status, setContainersStatus] = useState<{cid: number, status: ContainerStatus}[]>([]);
  const [drawer_opened, { open: drawer_open, close: drawer_close }] = useDisclosure(false);
  const [modal_opened, { open: modal_open, close: modal_close }] = useDisclosure(false);
  const [update_prop, setUpdateProp] = useState<{status: ContainerStatus, cid: number}>({status: ContainerStatus.UKNOWN, cid: 0});
  const [create_from_cid, setCreateFromCid] = useState<number>(0);
  const [create_img_name, setCreateImgName] = useState('');
  const [create_img_public, setCreateImgPublic] = useState(false);

  const createImage = async (notification_id: string) => {
    let iid;
    try {
      const response : Response = await fetch('/images/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({
          cid: create_from_cid,
          name: create_img_name,
          public: create_img_public
        }),
        credentials: 'include'
      });

      let parsedResult : {status: number, error: string, iid: number} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || parsedResult.error) {
        console.error(`Update container status failed: ${parsedResult.error}`);
        throw new Error(`Update container status failed: ${parsedResult.error}`);
      }

      iid = parsedResult.iid;
      notifications.update({
        loading: false,
        autoClose: true,
        withCloseButton: true,
        id: notification_id,
        title: '操作成功!',
        color: 'rgba(0, 255, 0, 0.5)',
        message: `成功创建镜像${iid}`
      });
    } catch (err: any) {
      notifications.update({
        loading: false,
        autoClose: true,
        withCloseButton: true,
        id: notification_id,
        title: '操作失败!',
        color: 'rgba(255, 0, 0, 0.5)',
        message: err.error
      });
    }
  }

  const updateContainer = async () => {
    try {
      const response : Response = await fetch('/containers/' + update_prop.cid, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify({ cmd : update_prop.status == ContainerStatus.STOPPING ? 'stop' : 'start' }),
        credentials: 'include'
      });

      let parsedResult : {status: number, error: string} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || parsedResult.error) {
        console.error(`Update container status failed: ${parsedResult.error}`);
        throw new Error(`Update container status failed: ${parsedResult.error}`);
      }
      notifications.show({
        title: '操作成功!',
        color: 'rgba(0, 255, 0, 0.5)',
        message: `成功${update_prop.status == ContainerStatus.STOPPING ? '停止' : '启动'}容器${update_prop.cid}`
      });
      refreshTable();
    } catch (err: any) {
      notifications.show({
        title: '操作失败!',
        color: 'rgba(255, 0, 0, 0.5)',
        message: err.error
      });
    }
  }

  const deleteContainer = async () => {
    try {
      const response : Response = await fetch('/containers/' + update_prop.cid, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : {status: number, error: string} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || parsedResult.error) {
        console.error(`Update container status failed: ${parsedResult.error}`);
        throw new Error(`Update container status failed: ${parsedResult.error}`);
      }
      
      notifications.show({
        title: '操作成功!',
        color: 'rgba(0, 255, 0, 0.5)',
        message: `成功删除容器${update_prop.cid}`
      });
      
      setContainersData([]);
      refreshTable();
    } catch (err: any) {
      notifications.show({
        title: '操作失败!',
        color: 'rgba(255, 0, 0, 0.5)',
        message: err.error
      });
    }
  }

  const getContainerList = async () => {
    let ret : string[] = [];
    try {
      const response : Response = await fetch('/containers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : {status: number, cid: string[]} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || !parsedResult.cid) {
        console.error('Get containers failed');
        throw new Error('Get containers failed');
      }

      ret =  parsedResult.cid;
    } catch (err: any) {
      // TODO
    }
    return ret;
  }

  const getContainerStatus = async (cid: string) => {
    let status : string = 'Error';
    try {
      const response : Response = await fetch('/containers/status/'+cid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : {status: number, result: string, error: string} = JSON.parse(await parseBody(response));

      if (!response.ok || parsedResult.status !== 0 || !parsedResult.result) {
        throw new Error('Get container status failed');
      }

      status = parsedResult.result;
    } catch (err: any) {
      // TODO
    }
    return status;
  }

  const getContainerProperty = async (cid: string) => {
    let property : ContainerData = {
      cid: Number(cid),
      status: "Error",  // 不是 container 的 status 而是请求结果的 status
      name: "Error",
      cpu: "Error",
      memory: "Error",
      portssh: "Error",
      portjupyter: "Error",
      porttsb: "Error",
      passwd: "Error",
      ip: "Error",
      cpu_name: "Error",
      gpu_type: "Error"
    };
    try {
      const response : Response = await fetch('/containers/property/'+cid, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        credentials: 'include'
      });

      let parsedResult : ContainerData = JSON.parse(await parseBody(response));

      if (!response.ok || Number(parsedResult.status) !== 0) {
        throw new Error('Get container property failed');
      }

      property = parsedResult;
    } catch (err: any) {
      // TODO
    }
    return property;
  }

  const refreshTable = async () => {
    setFetching(true);
    const containers = await getContainerList();
    var containers_status: {cid: number, status: ContainerStatus}[] = await Promise.all(containers.map(async (cid, idx) => {
      const status = await getContainerStatus(cid);
      return {
        cid: Number(cid),
        status: status == 'running' ? ContainerStatus.RUNNING : ContainerStatus.STOP
      }
    }));
    setContainersStatus(containers_status);
    var data: ContainerData[] = await Promise.all(containers.map(async (cid, idx) => {
      let container_data : ContainerData = {
        cid: Number(cid),
        status: "Unknown",  // 不能用这个,这个不是钩子
        name: "Unknown",
        cpu: "Unknown",
        memory: "Unknown",
        portssh: "Unknown",
        portjupyter: "Unknown",
        porttsb: "Unknown",
        passwd: "Unknown",
        ip: "Unknown",
        cpu_name: "Unknown",
        gpu_type: "Unknown"
      };
      const _prop = await getContainerProperty(cid);
      container_data.name = _prop.name;
      container_data.cpu = _prop.cpu;
      container_data.memory = _prop.memory;
      container_data.portssh = _prop.portssh;
      container_data.portjupyter = _prop.portjupyter;
      container_data.porttsb = _prop.porttsb;
      container_data.passwd = _prop.passwd;
      container_data.ip = _prop.ip;
      container_data.cpu_name = _prop.cpu_name;
      container_data.gpu_type = _prop.gpu_type;
      return container_data;
    }));
    setContainersData(data);
    setFetching(false);
  }

  useEffect(() => {
    refreshTable();
  }, []);

  const form = useForm({mode: 'uncontrolled'});

  return (fetching ? <div className='flex h-full items-center justify-center'><Loader color="rgba(255, 31, 31, 0.6)" size="xl" /></div> : <>
    <Table data={{
      caption: containers_data.length > 0 ? '' : '您还没有创建任何容器',
      head: [
        <p className='text-center'>实例ID/名称</p>,
        <p className='text-center'>状态</p>,
        <p className='text-center'>规格详情</p>,
        <p className='text-center'>SSH登录</p>,
        <p className='text-center'>面板</p>,
        <p className='text-center'>操作</p>
      ],
      body: containers_data.map((container_data, idx) => {
        const host_data = [{
          title: 'CPU型号',
          label: container_data.cpu_name
        },{
          title: 'CPU核心',
          label: container_data.cpu
        },{
          title: 'GPU型号',
          label: container_data.gpu_type
        },{
          title: '内存',
          label: container_data.memory
        }];

        return [
          <div className='text-center'>
            <Text fw={700}>
              {container_data.name}
            </Text>
            <Text size="sm" c="gray.6">
              ID: {container_data.cid}
            </Text>
          </div>,
          <div className='text-center'>
            <Text size="sm" c={
              containers_status[idx].status == ContainerStatus.RUNNING ? 'teal.6' : 
              containers_status[idx].status == ContainerStatus.STOP ? 'gray.6' : 'cyan.6'
            }>
              {containers_status[idx].status}
            </Text>
          </div>,
          <div className=''>
            <Table variant="vertical" layout="auto">
              <Table.Tbody>
                {host_data.map((value, idx) => { return (
                  <Table.Tr key={idx}>
                  <Table.Th w={85}>{value.title}</Table.Th>
                  <Table.Td>{value.label}</Table.Td>
                  </Table.Tr>
                )})}
              </Table.Tbody>
            </Table>
          </div>,
          <div className='space-y-1' >
            <div className='flex justify-center' >
                <InlineCodeHighlight
                  code={'ssh root@' + container_data.ip + ' -p ' + container_data.portssh}
                  language="shell"
                />
            </div>
            <div className='flex flex-col space-y-2  justify-center' >
              <Container w={210}>
                <CopyButton value={container_data.passwd}>
                  {({ copied, copy }) => (
                    <Button
                    fullWidth
                      variant="light"
                      color={copied ? 'teal' : 'blue'}
                      onClick={copy}
                      rightSection={copied  ?  <IconCheck size={14} /> : <IconCopy size={14} />}
                      size="compact-xs"
                    >
                      {copied ? '已复制' : '复制密码'}
                    </Button>
                  )}
                </CopyButton>
              </Container>
              <Container w={210}>
                <PasswordInput size='xs' value={container_data.passwd} defaultValue={container_data.passwd}/>
              </Container>
            </div>
          </div>,
          <div className='flex flex-col' >
            <NavLink
              href={'http://' + container_data.ip + ':' + container_data.portjupyter}
              label='JupyterLab'
              leftSection={
                <IconBrandPython size="1.2rem" stroke={1.5} className="mantine-rotate-rtl" />
              }
            />
            <NavLink
              href={'http://' + container_data.ip + ':' + container_data.porttsb}
              label='TensorBoard'
              leftSection={
                <IconChartHistogram size="1.2rem" stroke={1.5} className="mantine-rotate-rtl" />
              }
            />
            <NavLink
              href={'http://' + container_data.ip + ':3000/public-dashboards/5192664c23254fd3ba56f3ae1701a1a0?orgId=1&refresh=5s'}
              label='Grafana'
              leftSection={
                <IconActivity size="1.2rem" stroke={1.5} className="mantine-rotate-rtl" />
              }
            />
          </div>,
          <div className='flex flex-col gap-4'>
            <Button
              variant="light"
              loading={containers_status[idx].status == ContainerStatus.STARTING || containers_status[idx].status == ContainerStatus.STOPPING}
              onClick={() => {
                setUpdateProp({
                  status: containers_status[idx].status == ContainerStatus.RUNNING ? ContainerStatus.STOPPING : ContainerStatus.STARTING,
                  cid: container_data.cid
                });
                drawer_open();
              }}>
              {containers_status[idx].status == ContainerStatus.RUNNING ? '停止' : '启动'}
            </Button>
            <Button
              variant="light"
              disabled={containers_status[idx].status != ContainerStatus.STOP}
              onClick={() => {
                setCreateFromCid(container_data.cid);
                modal_open();
              }}
            >
              创建镜像
            </Button>
            <Button
              color="rgba(255, 0, 0, 0.5)"
              variant="light"
              disabled={containers_status[idx].status != ContainerStatus.STOP}
              onClick={() => {
                setUpdateProp({
                  status: ContainerStatus.DELETING,
                  cid: container_data.cid
                });
                drawer_open();
              }}>
              删除容器
            </Button>
          </div>
        ];
      })
    }}/>
    <Drawer opened={drawer_opened} onClose={drawer_close} position="bottom">
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col justify-center'>
          <Text size="xl">您确定要{update_prop.status == ContainerStatus.STOPPING ? '停止' : update_prop.status == ContainerStatus.STARTING ? '启动' : '删除'}容器{update_prop.cid}吗?</Text>
          <Image h={200} w="auto" fit="contain" src={update_prop.status == ContainerStatus.STOPPING ? '/taffy11.png' : update_prop.status == ContainerStatus.STARTING ? "/taffy12.png" : "/taffy13.png"}/>
          <Button
            variant="light"
            color="rgba(255, 0, 0, 0.5)"
            onClick={() => {
              drawer_close();
              var t = containers_status;
              const idx = t.findIndex(item => item.cid == update_prop.cid);
              t[idx].status = update_prop.status;
              setContainersStatus(t);
              if(update_prop.status == ContainerStatus.DELETING){
                deleteContainer();
              } else {
                updateContainer();
              }
            }}>
            我确认
          </Button>
        </div>
      </div>
    </Drawer>
    <Modal opened={modal_opened} onClose={modal_close} title="创建镜像" centered>
      <Text size="sm" c="gray.6">
        将从容器{create_from_cid}创建镜像
      </Text>
        <TextInput
          withAsterisk
          label="镜像名称"
          key={form.key('name')}
          placeholder="your container name"
          value={create_img_name}
          onChange={(event: { currentTarget: { value: SetStateAction<string>; }; }) => setCreateImgName(event.currentTarget.value)}
          rightSectionPointerEvents="all"
          mt="md"
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => setCreateImgName('')}
              style={{ display: create_img_name ? undefined : 'none' }}
            />
          }
        />
        <Text size="sm" c="gray.6">
          是否公开您的镜像:
        </Text>
        <SegmentedControl
          fullWidth
          name='public'
          onChange={(v: string) => {setCreateImgPublic(v=='true'?true:false)}}
          data={[
          {
            value: 'true',
            label: (
              <Center style={{ gap: 10 }}>
                <IconEye style={{ width: rem(16), height: rem(16) }} />
                <span>公开镜像</span>
              </Center>
            )
          },{
            value: 'false',
            label: (
              <Center style={{ gap: 10 }}>
                <IconLock style={{ width: rem(16), height: rem(16) }} />
                <span>私有镜像</span>
              </Center>
            )
          }
        ]}/>
        <Button disabled={!create_img_name} variant="light" type="submit" fullWidth
          onClick = {() => {
            const notification_id = notifications.show({
              title: '执行中......',
              message: `正在从容器${create_from_cid}创建镜像`,
              loading: true,
              autoClose: false,
              withCloseButton: false,
            });
            createImage(notification_id);
            modal_close();
          }}>确认</Button>
    </Modal>
  </>);
}