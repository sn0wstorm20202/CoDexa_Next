interface props {
    params: Promise <{
        projectId: string;
    }>
};
    

const Page =async({params}:props)=> {
    const { projectId } = await params;
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Project Page</h1>
            <p className="text-gray-600">Project ID: {projectId}</p>
        </div>
    );
}

export default Page;