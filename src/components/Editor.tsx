"use client"
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { FC, use, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import { zodResolver } from "@hookform/resolvers/zod"
import type EditorJS from '@editorjs/editorjs'
import { set } from 'date-fns'
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import axios from 'axios'



interface EditorProps {
  subredditId: string
}

const Editor: FC<EditorProps> = ({ subredditId }) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostCreationRequest>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      subredditId,
      title: "",
      content: ""
    }
  })

  const ref = useRef<EditorJS>()

  const [isMounted, setIsMounted] = useState<boolean>(false)



  // async function uploadImageToBlobStorage(file: File) {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     const response = await axios.post(
  //       process.env.AZURE_STORAGE_CONNECTION_STRING +
  //       "/",
  //       formData,
  //       {
  //         headers: {
  //           Authorization: "Bearer " + process.env.SAS_TOKEN,
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       const blobUrl = response.data.url;
  //       return blobUrl;
  //     } else {
  //       return {
  //         success: 0,
  //         error: "Image upload failed.",
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const initializeEditor = useCallback(async () => {
    const { default: EditorJS } = await import('@editorjs/editorjs')
    const { default: Header } = await import('@editorjs/header')
    const { default: Embed } = await import('@editorjs/embed')
    const { default: Table } = await import('@editorjs/table')
    const { default: Code } = await import('@editorjs/code')
    const { default: List } = await import('@editorjs/list')
    const { default: LinkTool } = await import('@editorjs/link')
    const { default: InlineCode } = await import('@editorjs/inline-code')
    const { default: ImageTool } = await import('@editorjs/image')

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady: () => {
          ref.current = editor
        },
        placeholder: 'Start writing your post...',
        inlineToolbar: true,
        data: {
          blocks: []
        },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file: Blob) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  console.log("Client file", file, formData.get('file'))

                  const response = await axios.post('/api/upload', formData , {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                  });


                  return {
                    success: 1,
                    file: {
                      url: response.data.file.url,
                    },
                  };
                },
              },
            },
          },

          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed
        }
      })



    }
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true)
    }
  }, [])
  useEffect(() => {
    const init = async () => {
      await initializeEditor()

      setTimeout(() => {
        // set focus to title
      })

    }
    if (isMounted) {
      init()
      return () => { }
    }
  }, [isMounted, initializeEditor])


  return <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
    <form
      id='subreddit-post-form'
      className='w-fit'
    // onSubmit={handleSubmit(onSubmit)}
    >
      <div className='prose prose-stone dark:prose-invert'>
        <TextareaAutosize
          // ref={(e) => {
          //   titleRef(e)
          // @ts-ignore
          //   _titleRef.current = e
          // }}
          // {...rest}
          placeholder='Title'
          className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none'
        />
        <div id='editor' className='min-h-[500px]' />
        <p className='text-sm text-gray-500'>
          Use{' '}
          <kbd className='rounded-md border bg-muted px-1 text-xs uppercase'>
            Tab
          </kbd>{' '}
          to open the command menu.
        </p>
      </div>
    </form>
  </div>
}

export default Editor