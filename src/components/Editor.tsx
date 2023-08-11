"use client"
import { toast } from '@/hooks/use-toast'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import type EditorJS from '@editorjs/editorjs'
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'



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

  const _titleRef = useRef<HTMLTextAreaElement>(null)

  const ref = useRef<EditorJS>()

  const [isMounted, setIsMounted] = useState<boolean>(false)
  const pathname = usePathname()
  const router = useRouter()


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

  function convertFileToBase64(file:Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  }
  

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
                uploadByFile: async (file:Blob) => {
                  try {
                    // Convert file to base64 string
                    const base64String = await convertFileToBase64(file);
          
                    // Upload base64 string to blob storage
                    const response = await axios.post('/api/upload', { base64String });
          
                    // Return the response in the correct format
                    return {
                      success: 1,
                      file: {
                        url: response.data.url,
                      },
                    };
                  } catch (error) {
                    // console.error('Error uploading image:', error);
                    return {
                      success: 0,
                      file: {
                        url: '',
                      },
                    };
                  }
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
    if (Object.keys(errors).length > 0) {
      // eslint-disable-next-line 
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: 'Error',
          description: (value as { message: string }).message,
          variant: 'destructive'
        })
      }
    }
  }, [errors])

  useEffect(() => {
    const init = async () => {
      await initializeEditor()

      setTimeout(() => {
        // set focus to title
        _titleRef.current?.focus()
      })

    }
    if (isMounted) {
      init()
      return () => {
        ref.current?.destroy()
        ref.current = undefined
      }
    }
  }, [isMounted, initializeEditor])

  const { mutate: createPost } = useMutation({
    mutationFn: async ({ title, content, subredditId }: PostCreationRequest) => {
      const payload: PostCreationRequest = {
        title,
        content,
        subredditId
      }
      const { data } = await axios.post('/api/subreddit/post/create', payload)
      return data
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Your post is not published. Please try again later',
        variant: 'destructive'
      })
    },
    onSuccess: () => {
      const newpathname = pathname.split('/').slice(0, -1).join('/')
      router.push(newpathname)
      router.refresh()
      toast({
        description: 'Your post is published',
      })
    }

  })

  async function onSubmit(data: PostCreationRequest) {
    const blocks = await ref.current?.save() || { blocks: [] }
    const payload: PostCreationRequest = {
      title: data.title,
      content: blocks,
      subredditId
    }

    createPost(payload)
  }

  const { ref: titleRef, ...titleProps } = register('title')

  return <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
    <form
      id='subreddit-post-form'
      className='w-fit'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='prose prose-stone dark:prose-invert'>
        <TextareaAutosize
          ref={e => {
            titleRef(e)
            // @ts-ignore
            _titleRef.current = e
          }}
          {...titleProps}
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